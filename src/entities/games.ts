import { Exclude, Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsInt, Min, Max, MinLength, MaxLength, IsString, IsBoolean, IsOptional, IsUrl, IsObject } from 'class-validator';

@Entity("games")
export class GamesEntity {
    @IsInt()
    @Min(0)
    @Max(2147483647)
    @PrimaryGeneratedColumn()
    game_id?: number;
    
    @MinLength(1)
    @MaxLength(32)
    @Column()
    game_name?: string;
    
    @IsBoolean()
    @Column({ type: 'boolean' })
    on_shelve?: boolean;
    
    @IsOptional()
    @IsInt()
    @Min(0)
    @Column({ type: 'bigint', nullable: true })
    create_time?: number = Date.now();
    
    @IsOptional()
    @MinLength(1)
    @MaxLength(2048)
    @Column({ nullable: true })
    description?: string;
    
    @IsOptional()
    @IsUrl()
    @Column({ nullable: true })
    cover_url?: string;
    
    @IsOptional()
    @IsUrl()
    @Column({ nullable: true })
    icon_url?: string;
    
    @IsOptional()
    @MinLength(1)
    @Column({ nullable: true })
    server_image?: string;

    @IsOptional()
    @MinLength(1)
    @Column({ nullable: true })
    server_config?: string;
    
    @IsOptional()
    @MinLength(1)
    @Column({ nullable: true })
    client_resources?: string;
    
    @IsOptional()
    @IsObject()
    @Column({ type: 'json', nullable: true })
    client_config?: object;
    
    @IsOptional()
    @IsObject()
    @Column({ type: 'json', nullable: true })
    details?: object;
}