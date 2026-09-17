import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  statusCode: number,
  data: any,
  meta?: any
) => {
  const responseData: any = {
    success: true,
    data,
  };
  
  if (meta) {
    responseData.meta = meta;
  }
  
  res.status(statusCode).json(responseData);
};

export const sendError = (
  res: Response,
  statusCode: number,
  errorData: any
) => {
  res.status(statusCode).json({
    success: false,
    error: errorData
  });
};
