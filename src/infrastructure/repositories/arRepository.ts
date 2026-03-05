import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

import type { IArRepository } from "~/application/repositories/arRepository";
import {
	ArPayment,
	ArPaymentAllocation,
	type NewArPayment,
	type NewArPaymentAllocation,
} from "~/domain/ar";
import * as schema from "~/infrastructure/models";
import type { SalesInvoice } from "~/infrastructure/models/sales";

export class ArRepository implements IArRepository {
	constructor(private db: MySql2Database<typeof schema>) {}

	private toDomainAllocation(
		row: typeof schema.arPaymentAllocations.$inferSelect,
	): ArPaymentAllocation {
		return new ArPaymentAllocation(
			row.id,
			row.arPaymentId,
			row.salesInvoiceId,
			Number(row.allocatedAmount),
			Number(row.discountAmount),
		);
	}

	private toDomainPayment(
		row: typeof schema.arPayments.$inferSelect,
		allocations: (typeof schema.arPaymentAllocations.$inferSelect)[],
	): ArPayment {
		return new ArPayment(
			row.id,
			row.customerId,
			row.depositAccountId,
			row.discountAccountId,
			row.journalId,
			row.paymentDate,
			Number(row.discountPercent),
			Number(row.totalAllocated),
			Number(row.totalReceived),
			allocations.map((a) => this.toDomainAllocation(a)),
		);
	}

	async createPayment(
		payment: NewArPayment,
		allocations: NewArPaymentAllocation[],
	): Promise<ArPayment> {
		return await this.db.transaction(async (tx) => {
			await tx.insert(schema.arPayments).values({
				...payment,
				discountPercent: payment.discountPercent.toString(),
				totalAllocated: payment.totalAllocated.toString(),
				totalReceived: payment.totalReceived.toString(),
			});

			const insertedPayments = await tx
				.select()
				.from(schema.arPayments)
				.orderBy(desc(schema.arPayments.createdAt))
				.limit(1);
			const insertedPayment = insertedPayments[0];

			if (!insertedPayment) {
				throw new Error("Failed to create AR payment");
			}

			const allocationsWithPaymentId = allocations.map((alloc) => ({
				...alloc,
				allocatedAmount: alloc.allocatedAmount.toString(),
				arPaymentId: insertedPayment.id,
				discountAmount: alloc.discountAmount.toString(),
			}));

			await tx
				.insert(schema.arPaymentAllocations)
				.values(allocationsWithPaymentId);

			for (const alloc of allocations) {
				const invoiceResult = await tx
					.select()
					.from(schema.salesInvoices)
					.where(eq(schema.salesInvoices.id, alloc.salesInvoiceId))
					.limit(1);
				const invoice = invoiceResult[0];

				if (invoice) {
					const newPaidAmount =
						Number(invoice.paidAmount) + Number(alloc.allocatedAmount);
					const newRemainingAmount =
						Number(invoice.totalAmount) - newPaidAmount;
					const status = newRemainingAmount <= 0 ? "PAID" : "PARTIALLY_PAID";

					await tx
						.update(schema.salesInvoices)
						.set({
							paidAmount: newPaidAmount.toString(),
							remainingAmount: newRemainingAmount.toString(),
							status: status as "OPEN" | "PARTIALLY_PAID" | "PAID",
							updatedAt: new Date(),
						})
						.where(eq(schema.salesInvoices.id, alloc.salesInvoiceId));
				}
			}

			const rawLines = await tx
				.select()
				.from(schema.arPaymentAllocations)
				.where(eq(schema.arPaymentAllocations.arPaymentId, insertedPayment.id));

			return this.toDomainPayment(insertedPayment, rawLines);
		});
	}

	async findUnpaidInvoicesByCustomer(
		customerId: string,
	): Promise<SalesInvoice[]> {
		return this.db
			.select()
			.from(schema.salesInvoices)
			.where(
				and(
					eq(schema.salesInvoices.customerId, customerId),
					inArray(schema.salesInvoices.status, ["OPEN", "PARTIALLY_PAID"]),
					isNull(schema.salesInvoices.deletedAt),
				),
			)
			.orderBy(schema.salesInvoices.dueDate);
	}

	async getDashboardSummary(): Promise<{
		totalPiutang: number;
		totalJatuhTempo: number;
	}> {
		const result = await this.db
			.select({
				totalJatuhTempo: sql<string>`sum(case when ${schema.salesInvoices.dueDate} < current_date() then ${schema.salesInvoices.remainingAmount} else 0 end)`,
				totalPiutang: sql<string>`sum(${schema.salesInvoices.remainingAmount})`,
			})
			.from(schema.salesInvoices)
			.where(
				and(
					inArray(schema.salesInvoices.status, ["OPEN", "PARTIALLY_PAID"]),
					isNull(schema.salesInvoices.deletedAt),
				),
			);

		return {
			totalJatuhTempo: Number(result[0]?.totalJatuhTempo || 0),
			totalPiutang: Number(result[0]?.totalPiutang || 0),
		};
	}

	async findAllPayments(): Promise<ArPayment[]> {
		const notDeleted = isNull(schema.arPayments.deletedAt);

		const payments = await this.db
			.select()
			.from(schema.arPayments)
			.where(notDeleted)
			.orderBy(
				desc(schema.arPayments.paymentDate),
				desc(schema.arPayments.createdAt),
			);

		if (payments.length === 0) return [];

		const paymentIds = payments.map((p) => p.id);

		const allAllocations = await this.db
			.select()
			.from(schema.arPaymentAllocations)
			.where(inArray(schema.arPaymentAllocations.arPaymentId, paymentIds));

		return payments.map((payment) =>
			this.toDomainPayment(
				payment,
				allAllocations.filter((a) => a.arPaymentId === payment.id),
			),
		);
	}
	async findAllUnpaidInvoices(): Promise<
		(SalesInvoice & { customer: { name: string } })[]
	> {
		const results = await this.db
			.select({
				customer: {
					name: schema.customers.name,
				},
				invoice: schema.salesInvoices,
			})
			.from(schema.salesInvoices)
			.innerJoin(
				schema.customers,
				eq(schema.salesInvoices.customerId, schema.customers.id),
			)
			.where(
				and(
					inArray(schema.salesInvoices.status, ["OPEN", "PARTIALLY_PAID"]),
					isNull(schema.salesInvoices.deletedAt),
				),
			)
			.orderBy(schema.salesInvoices.dueDate);

		return results.map((r) => ({
			...r.invoice,
			customer: r.customer,
		}));
	}
}
