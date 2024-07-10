import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive } from "class-validator";

export class PaginationDto {

    @IsPositive()
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1;

    @IsPositive()
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 10;
}