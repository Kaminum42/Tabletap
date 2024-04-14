import { Exclude, Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsInt, Min, Max, MinLength, MaxLength, IsString, IsBoolean, IsOptional, IsUrl, IsObject, IsArray } from 'class-validator';

@Entity("rounds")
export class RoundsEntity {
    @IsInt()
    @Min(0)
    @Max(2147483647)
    @PrimaryGeneratedColumn()
    round_id?: number;
    
    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column()
    associated_game?: number;
    
    @IsArray()
    @IsInt({ each: true })
    @Min(0, { each: true })
    @Max(2147483647, { each: true })
    @Column({ type: 'simple-array' })
    players?: number[];
    
    @IsOptional()
    @IsInt()
    @Min(0)
    @Column({ type: 'bigint', nullable: true })
    create_time?: number = Date.now();
    
    @IsArray()
    @IsInt({ each: true })
    @Min(0, { each: true })
    @Max(2147483647, { each: true })
    @Column({ type: 'simple-array' })
    scores?: number[];
    
    @IsOptional()
    @IsObject()
    @Column({ type: 'json', nullable: true })
    details?: object;
}