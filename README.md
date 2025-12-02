# What I learned through this project

- Different decorators that TypeORM uses
  - **@Entity()**: tells typeORM to go to the database and check whether there exist the table named with that entity
  - **@PrimaryGeneratedColumn()**: creates a primary key column to the table
  - **@Column()**: makes TypeORM to create a column into the table of that entity

  ```
  @Entity()
  export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;
  @Column()
  password: string;
  }
  ```
   - **@AfterInsert()**: Defines what to do after data is inserted in entity table

  - **@AfterUpdate()**: Defines what to after data is updated in entity table

  - **@AfterRemove()**: Defines what to do after data is removed from entity table
 

```
 @AfterInsert()
  logInsert() {
    console.log('Inserted user with id', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated user with id', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('Remove user with id', this.id);
  }
```
