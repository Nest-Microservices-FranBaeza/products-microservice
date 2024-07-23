import {
    HttpStatus,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger(ProductsService.name);

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Connected to the database');
    }

    create(createProductDto: CreateProductDto) {
        return this.product.create({
            data: createProductDto,
        });
    }

    async findAll(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;

        const totalPages = await this.product.count({
            where: {
                available: true,
            },
        });

        return {
            data: await this.product.findMany({
                take: limit,
                skip: (page - 1) * limit,
                where: {
                    available: true,
                },
            }),
            metadata: {
                page: page,
                totalPages: Math.ceil(totalPages / limit),
            },
        };
    }

    async findOne(id: number) {
        const product = await this.product.findFirst({
            where: {
                id,
                available: true,
            },
        });

        if (!product) {
            throw new RpcException({
                status: HttpStatus.BAD_REQUEST,
                message: `Product with id ${id} not found`,
            });
        }

        return product;
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        await this.findOne(id);

        const { id: __, ...data } = updateProductDto;

        return this.product.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        await this.findOne(id);

        const product = await this.product.update({
            where: { id },
            data: {
                available: false,
            },
        });

        return product;
    }

    async validateProducts(ids: number[]) {
        ids = Array.from(new Set(ids));

        const products = await this.product.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        if (products.length !== ids.length) {
            this.logger.error('Some products are invalid');
            throw new RpcException({
                status: HttpStatus.BAD_REQUEST,
                message: 'Some products are invalid',
            });
        }

        return products;
    }
}
