import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class TestEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('bigint')
    create_time: number;


    constructor() {
        this.create_time = Date.now();
        this.id = 0;
    }
}

