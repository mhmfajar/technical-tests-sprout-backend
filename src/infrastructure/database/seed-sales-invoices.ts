import "dotenv/config";
import { count } from "drizzle-orm";

import { customers } from "~/infrastructure/models/parties";
import {
	salesInvoiceLines,
	salesInvoices,
} from "~/infrastructure/models/sales";
import { db } from "./index";

async function runSeed() {
	console.log("Seeding sales invoices...");

	// First check if customers exist
	const customerCount = await db.select({ count: count() }).from(customers);
	if (customerCount[0].count === 0) {
		console.log("No customers found. Please run seed-customers.ts first.");
		process.exit(1);
	}

	// Get all customers
	const customerList = await db
		.select({ id: customers.id, name: customers.name })
		.from(customers);
	console.log(`Found ${customerList.length} customers`);

	// Check if sales invoices already exist
	const invoiceCount = await db.select({ count: count() }).from(salesInvoices);
	if (invoiceCount[0].count > 0) {
		console.log(
			"Sales invoices table is not empty. If you want to re-seed, clear it manually.",
		);
		process.exit(0);
	}

	// Get current date for invoice dates
	const today = new Date();
	const formatDate = (date: Date) => date;

	// Create sample sales invoices data
	const invoicesData = [
		{
			createdAt: new Date(),
			createdBy: "system",
			customerId: customerList[0].id, // PT. Maju Bersama
			dueDate: formatDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)), // Due in 30 days
			invoiceDate: formatDate(
				new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
			), // 30 days ago
			invoiceNumber: "INV/2024/001",
			notes: "Invoice untuk pengiriman barang bulan Januari",
			paidAmount: "16500000",
			remainingAmount: "0",
			status: "PAID" as const,
			subtotal: "15000000",
			taxAmount: "1500000",
			totalAmount: "16500000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		{
			createdAt: new Date(),
			createdBy: "system",
			customerId: customerList[1].id, // CV. Cahaya Abadi
			dueDate: formatDate(new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000)), // Due in 15 days
			invoiceDate: formatDate(
				new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
			), // 15 days ago
			invoiceNumber: "INV/2024/002",
			notes: "Invoice untuk jasa konsultasi",
			paidAmount: "0",
			remainingAmount: "9350000",
			status: "OPEN" as const,
			subtotal: "8500000",
			taxAmount: "850000",
			totalAmount: "9350000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		{
			createdAt: new Date(),
			createdBy: "system",
			customerId: customerList[2].id, // Toko Sinar Rejeki
			dueDate: formatDate(new Date(today.getTime() + 23 * 24 * 60 * 60 * 1000)), // Due in 23 days
			invoiceDate: formatDate(
				new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
			), // 7 days ago
			invoiceNumber: "INV/2024/003",
			notes: "Partial payment received",
			paidAmount: "2860000",
			remainingAmount: "2860000",
			status: "PARTIALLY_PAID" as const,
			subtotal: "5200000",
			taxAmount: "520000",
			totalAmount: "5720000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		{
			createdAt: new Date(),
			createdBy: "system",
			customerId: customerList[3].id, // PT. Global Teknologi
			dueDate: formatDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)), // Due in 30 days
			invoiceDate: formatDate(today), // Today
			invoiceNumber: "INV/2024/004",
			notes: "Invoice untuk pengadaan perangkat keras",
			paidAmount: "0",
			remainingAmount: "27500000",
			status: "OPEN" as const,
			subtotal: "25000000",
			taxAmount: "2500000",
			totalAmount: "27500000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		{
			createdAt: new Date(),
			createdBy: "system",
			customerId: customerList[0].id, // PT. Maju Bersama
			dueDate: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)), // Overdue 15 days
			invoiceDate: formatDate(
				new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000),
			), // 45 days ago (overdue)
			invoiceNumber: "INV/2024/005",
			notes: "Overdue invoice - belum ada pembayaran",
			paidAmount: "0",
			remainingAmount: "13200000",
			status: "OPEN" as const,
			subtotal: "12000000",
			taxAmount: "1200000",
			totalAmount: "13200000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
	];

	// Insert invoices
	await db.insert(salesInvoices).values(invoicesData);
	console.log(`${invoicesData.length} sales invoices seeded successfully!`);

	// Fetch inserted invoices to get their IDs
	const insertedInvoices = await db
		.select({
			id: salesInvoices.id,
			invoiceNumber: salesInvoices.invoiceNumber,
		})
		.from(salesInvoices);

	console.log(`${insertedInvoices.length} sales invoices retrieved!`);

	// Create line items for each invoice
	const lineItemsData = [
		// Invoice INV/2024/001 - PAID
		{
			createdAt: new Date(),
			createdBy: "system",
			itemName: "Laptop ASUS VivoBook 15",
			quantity: "5",
			salesInvoiceId: insertedInvoices[0].id,
			totalPrice: "12500000",
			unitPrice: "2500000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		{
			createdAt: new Date(),
			createdBy: "system",
			itemName: "Mouse Wireless",
			quantity: "5",
			salesInvoiceId: insertedInvoices[0].id,
			totalPrice: "750000",
			unitPrice: "150000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		{
			createdAt: new Date(),
			createdBy: "system",
			itemName: "Tas Laptop",
			quantity: "5",
			salesInvoiceId: insertedInvoices[0].id,
			totalPrice: "1750000",
			unitPrice: "350000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		// Invoice INV/2024/002 - OPEN
		{
			createdAt: new Date(),
			createdBy: "system",
			itemName: "Jasa Konsultasi IT (per jam)",
			quantity: "20",
			salesInvoiceId: insertedInvoices[1].id,
			totalPrice: "7000000",
			unitPrice: "350000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		{
			createdAt: new Date(),
			createdBy: "system",
			itemName: "Instalasi Jaringan",
			quantity: "1",
			salesInvoiceId: insertedInvoices[1].id,
			totalPrice: "1500000",
			unitPrice: "1500000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		// Invoice INV/2024/003 - PARTIALLY_PAID
		{
			createdAt: new Date(),
			createdBy: "system",
			itemName: "Printer Canon Pixma G3010",
			quantity: "2",
			salesInvoiceId: insertedInvoices[2].id,
			totalPrice: "3600000",
			unitPrice: "1800000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		{
			createdAt: new Date(),
			createdBy: "system",
			itemName: "Tinta Canon GI-790",
			quantity: "8",
			salesInvoiceId: insertedInvoices[2].id,
			totalPrice: "1600000",
			unitPrice: "200000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		// Invoice INV/2024/004 - OPEN
		{
			createdAt: new Date(),
			createdBy: "system",
			itemName: "Server Dell PowerEdge R750",
			quantity: "1",
			salesInvoiceId: insertedInvoices[3].id,
			totalPrice: "18000000",
			unitPrice: "18000000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		{
			createdAt: new Date(),
			createdBy: "system",
			itemName: "SSD Enterprise 960GB",
			quantity: "4",
			salesInvoiceId: insertedInvoices[3].id,
			totalPrice: "7000000",
			unitPrice: "1750000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
		// Invoice INV/2024/005 - OVERDUE
		{
			createdAt: new Date(),
			createdBy: "system",
			itemName: "Monitor LG 24 Inch",
			quantity: "10",
			salesInvoiceId: insertedInvoices[4].id,
			totalPrice: "12000000",
			unitPrice: "1200000",
			updatedAt: new Date(),
			updatedBy: "system",
		},
	];

	// Insert line items
	await db.insert(salesInvoiceLines).values(lineItemsData);

	console.log(
		`${lineItemsData.length} sales invoice line items seeded successfully!`,
	);
	console.log("\n=== Seed Summary ===");
	console.log(`- Sales Invoices: ${insertedInvoices.length}`);
	console.log(`- Line Items: ${lineItemsData.length}`);
	console.log(`- Status: 1 PAID, 2 OPEN, 1 PARTIALLY_PAID, 1 OVERDUE`);

	process.exit(0);
}

runSeed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
