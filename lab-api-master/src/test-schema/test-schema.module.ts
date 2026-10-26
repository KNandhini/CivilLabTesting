import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSchema } from './entities/test-schema.entity';
import { TestSchemaMapping } from './entities/test-schema-mapping.entity';
import { TestSchemaService } from './test-schema.service';
import { TestSchemaController } from './test-schema.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestSchema, TestSchemaMapping])],
  providers: [TestSchemaService],
  controllers: [TestSchemaController],
  exports: [TestSchemaService],
})
export class TestSchemaModule {}