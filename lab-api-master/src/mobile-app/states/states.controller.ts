import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StatesService } from './states.service';
import { CreateStateDto } from './dto/create-state.dto';

@ApiTags('states')
@Controller('states')
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new state' })
  create(@Body() createStateDto: CreateStateDto) {
    return this.statesService.create(createStateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all states' })
  findAll() {
    return this.statesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get state by id' })
  findOne(@Param('id') id: string) {
    return this.statesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update state' })
  update(@Param('id') id: string, @Body() updateStateDto: Partial<CreateStateDto>) {
    return this.statesService.update(id, updateStateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete state' })
  remove(@Param('id') id: string) {
    return this.statesService.remove(id);
  }
}