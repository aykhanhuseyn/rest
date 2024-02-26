import type { Request, Response, NextFunction } from "express";

export interface ErrRes {
	message: string;
	code: string;
	description?: string | Error;
}

declare module "express" {
	type Controller<Que = unknown, Bod = unknown, Res = unknown> = (
		request: Request<Que, Res | ErrRes, Bod>,
		response: Response<Res | ErrRes>,
		next: NextFunction,
	) => void;

	type AsyncController<Que = unknown, Bod = unknown, Res = unknown> = (
		request: Request<Que, Res | ErrRes, Bod>,
		response: Response<Res | ErrRes>,
		next: NextFunction,
	) => Promise<void>;
}
