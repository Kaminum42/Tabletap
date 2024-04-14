import { Exclude, Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsInt, Min, Max, MinLength, MaxLength, IsString, IsBoolean, IsOptional, IsUrl, IsObject, IsArray } from 'class-validator';

@Entity("announcements")
export class AnnouncementsEntity {
    @IsInt()
    @Min(0)
    @Max(2147483647)
    @PrimaryGeneratedColumn()
    announcement_id?: number;
    
    @MinLength(1)
    @MaxLength(64)
    @Column()
    title?: string;

    @IsString()
    @MinLength(1)
    @MaxLength(2048)
    @Column()
    content?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column()
    creator?: number;
    
    @IsOptional()
    @IsInt()
    @Min(0)
    @Column({ type: 'bigint', nullable: true })
    create_time?: number = Date.now();

    @IsOptional()
    @IsInt()
    @Min(0)
    @Column({ type: 'bigint', nullable: true })
    update_time?: number = Date.now();
    
    @IsOptional()
    @IsObject()
    @Column({ type: 'json', nullable: true })
    details?: object;
}