import "dotenv/config";
import { count } from "drizzle-orm";

import { customers } from "~/infrastructure/models/parties";
import { db } from "./index";

async function runSeed() {
	console.log("Seeding customers...");

	const result = await db.select({ count: count() }).from(customers);
	if (result[0].count > 0) {
		console.log(
			"Customers table is not empty. If you want to re-seed, clear it manually.",
		);
	} else {
		const customersData = [
			{
				address: "Jl. Jendral Sudirman No. 12, Jakarta",
				email: "contact@majubersama.com",
				name: "PT. Maju Bersama",
				phone: "021-5551234",
				taxIdNumber: "01.234.567.8-012.000",
			},
			{
				address: "Jl. Basuki Rahmat No. 45, Surabaya",
				email: "info@cahayaabadi.co.id",
				name: "CV. Cahaya Abadi",
				phone: "031-4445678",
				taxIdNumber: "02.345.678.9-023.000",
			},
			{
				address: "Pasar Baru Blok A No. 5, Bandung",
				email: "sinarrejeki@gmail.com",
				name: "Toko Sinar Rejeki",
				phone: "0812-3456-7890",
			},
			{
				address: "Sudirman Central Business District, Jakarta",
				email: "support@globaltek.id",
				name: "PT. Global Teknologi",
				phone: "021-9998888",
				taxIdNumber: "03.456.789.0-034.000",
			},
			{
				address: "Jl. Melati No. 8, Solo",
				email: "berkah@warung.com",
				name: "Warung Berkah",
				phone: "0856-7890-1234",
			},
		];

		for (const customer of customersData) {
			await db.insert(customers).values(customer);
		}

		console.log(`${customersData.length} customers seeded successfully!`);
	}
	process.exit(0);
}

runSeed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
