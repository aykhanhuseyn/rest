import { DataSource } from "typeorm";

import { User } from "./models";

export const database = new DataSource({
	entities: [User],
	database: "database.sqlite",
	logging: true,
	synchronize: true,
	type: "sqlite",
});
