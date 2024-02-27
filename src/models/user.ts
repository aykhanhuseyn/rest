import {
	BaseEntity,
	Column,
	Entity,
	Index,
	PrimaryGeneratedColumn,
} from "typeorm";
import { type InferType, date, object, string } from "yup";

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	readonly id!: number;

	@Index()
	@Column({ length: 256, unique: true })
	username!: string;

	@Column({ length: 256 })
	password!: string | null;

	@Column({ length: 64 })
	salt!: string | null;

	@Column({ length: 512 })
	verifier!: string | null;

	@Column({ length: 256 })
	firstName!: string | null;

	@Column({ length: 256 })
	lastName!: string | null;

	@Column()
	birthDate!: Date | null;

	@Column({ length: 256 })
	address!: string | null;

	@Column({ length: 256 })
	phone!: string | null;

	@Column({ length: 256 })
	email!: string | null;
}

export const loginSchema = object().shape({
	username: string().max(256).required("Username is not provided."),
	password: string().max(256).required("Password is not provided."),
});

export const srpRegisterSchema = object().shape({
	username: string().max(256).required("Username is not provided."),
	salt: string().max(64).required("Password is not provided."),
	verifier: string().max(512).required("Password is not provided."),
});

export const srpChallengeSchema = object().shape({
	username: string().max(256).required("Username is not provided."),
});

export const authenticateSchema = object().shape({
	username: string().required("Username is not provided."),
	// biome-ignore lint/style/useNamingConvention:
	A: string().required("A is not provided."),
	// biome-ignore lint/style/useNamingConvention:
	M1: string().required("M1 is not provided."),
});
export type AuthenticateSchema = InferType<typeof authenticateSchema>;

export const userDetailsSchema = object().shape({
	firstName: string().max(256).nullable(),
	lastName: string().max(256).nullable(),
	birthDate: date().nullable(),
	address: string().max(256).nullable(),
	phone: string().max(256).nullable(),
	email: string().max(256).email().nullable(),
});

export const userSchema = object()
	.concat(loginSchema)
	.concat(userDetailsSchema);
