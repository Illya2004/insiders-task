import { RoomCreateDto } from './room.create.dto';
import { PartialType } from '@nestjs/mapped-types';

export class RoomUpdateDto extends PartialType(RoomCreateDto) {}
