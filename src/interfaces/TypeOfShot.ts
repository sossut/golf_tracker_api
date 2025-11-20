import { RowDataPacket } from 'mysql2';

interface TypeOfShot {
  typeOfShotId: number;
  typeOfShot: string;
}

interface GetTypeOfShot extends RowDataPacket, TypeOfShot {}

type PostTypeOfShot = Omit<TypeOfShot, 'typeOfShotId'>;

type PutTypeOfShot = Partial<PostTypeOfShot>;

export { TypeOfShot, GetTypeOfShot, PostTypeOfShot, PutTypeOfShot };
