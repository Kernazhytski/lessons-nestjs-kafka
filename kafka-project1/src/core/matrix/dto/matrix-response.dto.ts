import { ApiProperty } from '@nestjs/swagger';

export class MatrixMultiplicationResponseDto {
  @ApiProperty({
    description: 'ID запроса',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Результат умножения матриц',
    example: [[7, 10], [15, 22]],
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  })
  result: number[][];

  @ApiProperty({
    description: 'Статус выполнения',
    example: 'completed',
  })
  status: 'completed' | 'error';

  @ApiProperty({
    description: 'Сообщение об ошибке (если есть)',
    example: null,
    required: false,
  })
  error?: string;
}

