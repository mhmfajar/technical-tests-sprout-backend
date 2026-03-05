import "dotenv/config";
import { randomUUID } from "node:crypto";
import { count } from "drizzle-orm";

import { accounts, type NewAccount } from "~/infrastructure/models/accounts";
import { db } from "./index";

async function runSeed() {
	console.log("Seeding accounts up to level 3...");

	const result = await db.select({ count: count() }).from(accounts);
	if (result[0].count > 0) {
		console.log("Accounts table is not empty. Clearing it first...");

		await db.execute(require("drizzle-orm").sql`SET FOREIGN_KEY_CHECKS = 0;`);
		await db.delete(accounts);
		await db.execute(require("drizzle-orm").sql`SET FOREIGN_KEY_CHECKS = 1;`);
	}

	const id100 = randomUUID();
	const id200 = randomUUID();
	const id300 = randomUUID();
	const id400 = randomUUID();
	const id500 = randomUUID();

	const level0: NewAccount[] = [
		{
			balance: "0",
			code: "100.000",
			id: id100,
			isControl: true,
			isSystem: true,
			level: 0,
			name: "ASET",
			type: "ASSET",
		},
		{
			balance: "0",
			code: "200.000",
			id: id200,
			isControl: true,
			isSystem: true,
			level: 0,
			name: "KEWAJIBAN",
			type: "LIABILITY",
		},
		{
			balance: "0",
			code: "300.000",
			id: id300,
			isControl: true,
			isSystem: true,
			level: 0,
			name: "EKUITAS",
			type: "EQUITY",
		},
		{
			balance: "0",
			code: "400.000",
			id: id400,
			isControl: true,
			isSystem: true,
			level: 0,
			name: "PENDAPATAN",
			type: "REVENUE",
		},
		{
			balance: "0",
			code: "500.000",
			id: id500,
			isControl: true,
			isSystem: true,
			level: 0,
			name: "BEBAN",
			type: "EXPENSE",
		},
	];

	const id110 = randomUUID();
	const id120 = randomUUID();
	const id210 = randomUUID();

	const level1: NewAccount[] = [
		{
			balance: "0",
			code: "110.000",
			id: id110,
			isControl: true,
			isSystem: true,
			level: 1,
			name: "ASET LANCAR",
			parentId: id100,
			type: "ASSET",
		},
		{
			balance: "0",
			code: "120.000",
			id: id120,
			isControl: true,
			isSystem: true,
			level: 1,
			name: "ASET TETAP",
			parentId: id100,
			type: "ASSET",
		},
		{
			balance: "0",
			code: "210.000",
			id: id210,
			isControl: true,
			isSystem: true,
			level: 1,
			name: "KEWAJIBAN JANGKA PENDEK",
			parentId: id200,
			type: "LIABILITY",
		},
	];

	const id111 = randomUUID();
	const id112 = randomUUID();
	const id113 = randomUUID();
	const id121 = randomUUID();
	const id122 = randomUUID();
	const id211 = randomUUID();

	const level2: NewAccount[] = [
		{
			balance: "0",
			code: "111.000",
			id: id111,
			isControl: true,
			isSystem: false,
			level: 2,
			name: "Kas & Bank",
			parentId: id110,
			type: "ASSET",
		},
		{
			balance: "0",
			code: "112.000",
			id: id112,
			isControl: true,
			isSystem: false,
			level: 2,
			name: "Piutang Usaha",
			parentId: id110,
			type: "ASSET",
		},
		{
			balance: "0",
			code: "113.000",
			id: id113,
			isControl: true,
			isSystem: false,
			level: 2,
			name: "Persediaan",
			parentId: id110,
			type: "ASSET",
		},
		{
			balance: "0",
			code: "121.000",
			id: id121,
			isControl: true,
			isSystem: false,
			level: 2,
			name: "Tanah dan Bangunan",
			parentId: id120,
			type: "ASSET",
		},
		{
			balance: "0",
			code: "122.000",
			id: id122,
			isControl: true,
			isSystem: false,
			level: 2,
			name: "Kendaraan",
			parentId: id120,
			type: "ASSET",
		},
		{
			balance: "0",
			code: "211.000",
			id: id211,
			isControl: true,
			isSystem: false,
			level: 2,
			name: "Utang Usaha",
			parentId: id210,
			type: "LIABILITY",
		},
	];

	const id111_001 = randomUUID();
	const id111_002 = randomUUID();
	const id111_003 = randomUUID();
	const id113_001 = randomUUID();

	const level3: NewAccount[] = [
		{
			balance: "15000000",
			code: "111.001",
			id: id111_001,
			isControl: false,
			isSystem: false,
			level: 3,
			name: "Kas Kecil Kantor",
			parentId: id111,
			type: "ASSET",
		},
		{
			balance: "50000000",
			code: "111.002",
			id: id111_002,
			isControl: false,
			isSystem: false,
			level: 3,
			name: "Bank BCA",
			parentId: id111,
			type: "ASSET",
		},
		{
			balance: "25000000",
			code: "111.003",
			id: id111_003,
			isControl: false,
			isSystem: false,
			level: 3,
			name: "Bank Mandiri",
			parentId: id111,
			type: "ASSET",
		},
		{
			balance: "10000000",
			code: "113.001",
			id: id113_001,
			isControl: false,
			isSystem: false,
			level: 3,
			name: "Persediaan Barang Dagang",
			parentId: id113,
			type: "ASSET",
		},
	];

	const allAccounts: NewAccount[] = [
		...level0,
		...level1,
		...level2,
		...level3,
	];

	console.log("Recalculating initial balances...");

	for (const acc of level3) {
		if (acc.balance !== "0") {
			let currentParentId: string | null | undefined = acc.parentId;
			while (currentParentId) {
				const parent = allAccounts.find((a) => a.id === currentParentId);
				if (!parent) break;
				parent.balance = (
					Number(parent.balance) + Number(acc.balance)
				).toString();
				currentParentId = parent.parentId;
			}
		}
	}

	for (const acc of allAccounts) {
		await db.insert(accounts).values(acc);
	}

	console.log("Accounts up to level 3 seeded successfully!");
	process.exit(0);
}

runSeed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
