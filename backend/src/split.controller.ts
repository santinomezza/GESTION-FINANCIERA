import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SplitExpenseDto } from './split-expense.dto';
import { SplitService } from './split.service';

@ApiTags('Split Tool')
@Controller('split')
export class SplitController {
    constructor(private readonly splitService: SplitService) { }

    @Post()
    @ApiOperation({
        summary: 'Calcula cómo dividir un gasto entre varias personas para que todos paguen lo mismo.',
        description: 'Recibe una lista de personas y cuánto pagó cada una, y devuelve las transferencias necesarias para saldar deudas. Soporta división equitativa: el total se divide en partes iguales y se calcula quién debe a quién.',
    })
    splitExpense(@Body() splitExpenseDto: SplitExpenseDto) {
        return this.splitService.calculate(splitExpenseDto);
    }
}
