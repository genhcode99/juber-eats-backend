import { NextFunction, Request, Response } from "express"

export function JwtMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(req.headers)
  next()
}