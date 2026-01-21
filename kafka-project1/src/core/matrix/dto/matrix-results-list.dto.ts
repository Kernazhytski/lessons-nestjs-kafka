import { ApiProperty } from '@nestjs/swagger';

export class MatrixResultItemDto {
  @ApiProperty({
    description: 'ID запроса',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Результат умножения матриц (если доступен)',
    example: [[7, 10], [15, 22]],
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    required: false,
  })
  result?: number[][];

  @ApiProperty({
    description: 'Статус выполнения',
    example: 'completed',
    enum: ['pending', 'completed', 'error'],
  })
  status: 'pending' | 'completed' | 'error';

  @ApiProperty({
    description: 'Сообщение об ошибке (если есть)',
    example: null,
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'Дата создания запроса',
    example: '2026-01-21T18:47:01.529Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата завершения обработки (если завершено)',
    example: '2026-01-21T18:47:13.529Z',
    required: false,
  })
  completedAt?: Date;
}

export class MatrixResultsListDto {
  @ApiProperty({
    description: 'Список всех результатов умножения матриц',
    type: [MatrixResultItemDto],
  })
  results: MatrixResultItemDto[];

  @ApiProperty({
    description: 'Общее количество результатов',
    example: 10,
  })
  total: number;
}



