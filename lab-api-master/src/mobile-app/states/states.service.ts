import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './entities/state.entity';
import { CreateStateDto } from './dto/create-state.dto';

@Injectable()
export class StatesService {
  constructor(
    @InjectRepository(State)
    private statesRepository: Repository<State>,
  ) {}

  async create(createStateDto: CreateStateDto) {
    const state = this.statesRepository.create(createStateDto);
    return await this.statesRepository.save(state);
  }

  async findAll() {
    return await this.statesRepository.find();
  }

  async findOne(id: string) {
    return await this.statesRepository.findOne({ where: { id } });
  }

  async update(id: string, updateStateDto: Partial<CreateStateDto>) {
    await this.statesRepository.update(id, updateStateDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.statesRepository.delete(id);
    return { message: 'State deleted successfully' };
  }
}