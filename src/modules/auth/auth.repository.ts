import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import { User } from 'src/entitys/user.entity'
import { EntityRepository, Repository } from 'typeorm'
import { AuthCredentialsDTO } from './dto/auth-credential.dto'
import * as bcrypt from 'bcryptjs'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(authCredentialsDto: AuthCredentialsDTO): Promise<void> {
    const { username, password } = authCredentialsDto
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = this.create({ username, password: hashedPassword })

    try {
      await this.save(user)
    } catch (error) {
      console.error(error)
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Existing username')
      } else {
        throw new InternalServerErrorException()
      }
    }
  }
}
