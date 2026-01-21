import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class MatrixDto {
  @ApiProperty({
    description: 'Матрица в виде двумерного массива чисел',
    example: [[1, 2], [3, 4]],
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @Type(() => Array)
  data: number[][];
}

export class MatrixMultiplicationRequestDto {
  @ApiProperty({
    description: 'Первая матрица',
    type: MatrixDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MatrixDto)
  matrixA: MatrixDto;

  @ApiProperty({
    description: 'Вторая матрица',
    type: MatrixDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MatrixDto)
  matrixB: MatrixDto;
}

