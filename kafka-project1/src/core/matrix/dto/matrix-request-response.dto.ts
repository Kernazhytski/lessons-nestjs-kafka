import { ApiProperty } from '@nestjs/swagger';

export class MatrixMultiplicationRequestResponseDto {
  @ApiProperty({
    description: 'ID запроса для отслеживания результата',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;
}



