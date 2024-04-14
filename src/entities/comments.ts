import { Exclude, Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsInt, Min, Max, MinLength, MaxLength, IsString, IsBoolean, IsOptional, IsUrl, IsObject, IsArray } from 'class-validator';

@Entity("comments")
export class CommentsEntity {
    @IsInt()
    @Min(0)
    @Max(2147483647)
    @PrimaryGeneratedColumn()
    comment_id?: number;

    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column()
    associated_game?: number;

    @IsInt()
    @Min(0)
    @Max(2147483647)
    @Column()
    user?: number;  

    @IsOptional()
    @IsInt()
    @Min(0)
    @Column({ type: 'bigint', nullable: true })
    create_time?: number = Date.now();

    @IsString()
    @MinLength(1)
    @MaxLength(2048)
    @Column()
    content?: string;
    
    @IsOptional()
    @IsObject()
    @Column({ type: 'json', nullable: true })
    details?: object;
}