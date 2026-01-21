import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MatrixService } from './matrix.service';
import { MatrixMultiplicationRequestDto } from './dto/matrix-multiplication.dto';
import { MatrixMultiplicationRequestResponseDto } from './dto/matrix-request-response.dto';
import { MatrixResultsListDto, MatrixResultItemDto } from './dto/matrix-results-list.dto';

@ApiTags('Matrix')
@Controller('matrix')
export class MatrixController {
  private readonly logger = new Logger(MatrixController.name);

  constructor(private readonly matrixService: MatrixService) {}

  @Post('multiply')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Отправить запрос на умножение двух матриц (асинхронно)' })
  @ApiResponse({
    status: 202,
    description: 'Запрос принят, возвращается ID для отслеживания результата',
    type: MatrixMultiplicationRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Неверный формат данных',
  })
  async multiply(
    @Body() request: MatrixMultiplicationRequestDto,
  ): Promise<MatrixMultiplicationRequestResponseDto> {
    this.logger.log('Received matrix multiplication request');
    
    try {
      const result = await this.matrixService.multiplyMatrices(
        request.matrixA.data,
        request.matrixB.data,
      );

      return result;
    } catch (error) {
      this.logger.error('Error sending matrix multiplication request:', error);
      throw error;
    }
  }

  @Get('results')
  @ApiOperation({ summary: 'Получить все результаты умножения матриц' })
  @ApiResponse({
    status: 200,
    description: 'Список всех результатов',
    type: MatrixResultsListDto,
  })
  async getAllResults(): Promise<MatrixResultsListDto> {
    this.logger.log('Getting all matrix multiplication results');
    
    const results = this.matrixService.getAllResults();
    
    return {
      results,
      total: results.length,
    };
  }

  @Get('results/:id')
  @ApiOperation({ summary: 'Получить результат умножения матриц по ID' })
  @ApiResponse({
    status: 200,
    description: 'Результат умножения матриц',
    type: MatrixResultItemDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Результат с указанным ID не найден',
  })
  async getResultById(@Param('id') id: string): Promise<MatrixResultItemDto> {
    this.logger.log(`Getting matrix multiplication result for ID: ${id}`);
    
    const result = this.matrixService.getResultById(id);
    
    if (!result) {
      throw new HttpException(`Result with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
    
    return result;
  }
}

