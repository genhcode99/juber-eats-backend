import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { JwtService } from "src/jwt/jwt.service"
import { MailService } from "src/mail/mail.service"
import { Repository } from "typeorm"
import { User } from "./entities/user.entity"
import { Verification } from "./entities/verification.entity"
import { UsersService } from "./users.service"

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
})

const mockJwtService = () => ({
  sign: jest.fn(() => "signed-token-baby"),
  verify: jest.fn(),
})

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
})

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

describe("UsersService", () => {
  let service: UsersService
  let usersRepository: MockRepository<User>
  let verificationsRepository: MockRepository<Verification>
  let mailService: MailService
  let jwtService: JwtService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile()
    jwtService = module.get<JwtService>(JwtService)
    service = module.get<UsersService>(UsersService)
    mailService = module.get<MailService>(MailService)
    usersRepository = module.get(getRepositoryToken(User))
    verificationsRepository = module.get(getRepositoryToken(Verification))
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  // Create Account
  describe("createAccount", () => {
    const createAccountArgs = {
      email: "bs@email.com",
      password: "bs.password",
      role: 0,
    }

    // 1.이미 아이디가 존재할 경우
    it("should fail if user exist", async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: "",
      })

      const result = await service.createAccount(createAccountArgs)

      expect(result).toMatchObject({
        ok: false,
        error: "There is a user with that email already",
      })
    })

    // 2.아이디가 정상적으로 생성되었을 경우
    it("should create a new user", async () => {
      usersRepository.findOne.mockResolvedValue(undefined)
      usersRepository.create.mockReturnValue(createAccountArgs)
      usersRepository.save.mockResolvedValue(createAccountArgs)
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      })
      verificationsRepository.save.mockResolvedValue({ code: "code" })

      const result = await service.createAccount(createAccountArgs)

      expect(usersRepository.create).toHaveBeenCalledTimes(1)
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs)

      expect(usersRepository.save).toHaveBeenCalledTimes(1)
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs)

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1)
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      })

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1)
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      })

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1)
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      )
      expect(result).toEqual({ ok: true, error: null })
    })

    // 3. 예외적인 문제가 발생했을 경우
    it("should fail on exception", async () => {
      usersRepository.findOne.mockRejectedValue(new Error())

      const result = await service.createAccount(createAccountArgs)

      expect(result).toEqual({ ok: false, error: "Couldn't create account." })
    })
  })

  // Login
  describe("login", () => {
    const logInArgs = {
      email: "bs@email.com",
      password: "bs.password",
    }

    // 1.유저가 존재하지 않을 경우
    it("should fail if user does not exist", async () => {
      usersRepository.findOne.mockResolvedValue(null)

      const result = await service.login(logInArgs)

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1)
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      )

      expect(result).toEqual({
        ok: false,
        error: "User not found",
        token: null,
      })
    })

    // 2.비밀번호가 틀렸을 경우
    it("should fail if the password is wrong", async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      }

      usersRepository.findOne.mockResolvedValue(mockedUser)

      const result = await service.login(logInArgs)

      expect(result).toEqual({
        ok: false,
        error: "Wrong password",
        token: null,
      })
    })

    // 3.로그인에 성공할 경우
    it("should return token if password correct", async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      }

      usersRepository.findOne.mockResolvedValue(mockedUser)

      const result = await service.login(logInArgs)

      expect(jwtService.sign).toHaveBeenCalledTimes(1)
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number))

      expect(result).toEqual({
        ok: true,
        error: null,
        token: "signed-token-baby",
      })
    })

    // 4. 예외적인 문제가 발생한 경우
    it("should fail on exception", async () => {
      usersRepository.findOne.mockRejectedValue(new Error())
      const result = await service.login(logInArgs)
      expect(result).toEqual({
        ok: false,
        error: "Can't log user in.",
        token: null,
      })
    })
  })

  // Find User
  describe("findById", () => {
    const findByIdArgs = {
      id: 1,
    }

    // 1. 유저를 찾았을 경우
    it("should find an existing user", async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs)
      const result = await service.findById(1)
      expect(result).toEqual({
        ok: true,
        user: findByIdArgs,
      })
    })

    // 2. 유저를 찾지 못했을 경우
    it("should fail if no user is found", async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error())
      const result = await service.findById(1)
      expect(result).toEqual({
        ok: false,
        error: "User Not Found",
      })
    })
  })

  // Edit Profile
  describe("editProfile", () => {
    // 1.이메일을 변경할 경우
    it("should change email", async () => {
      const oldUser = {
        email: "bs@old.com",
        verified: true,
      }
      const editProfileArgs = {
        userId: 1,
        input: { email: "bs@new.com" },
      }
      const newUser = {
        email: editProfileArgs.input.email,
        verified: false,
      }
      const newVerification = {
        code: "code",
      }

      usersRepository.findOne.mockResolvedValue(oldUser)
      verificationsRepository.create.mockReturnValue(newVerification)
      verificationsRepository.save.mockReturnValue(newVerification)

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input)

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1)
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      )

      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: newUser,
      })
      expect(verificationsRepository.save).toHaveBeenCalledWith(newVerification)

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1)
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      )
    })

    // 2. 비밀번호를 변경할 경우
    it("should change password", async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: "new.password" },
      }

      usersRepository.findOne.mockResolvedValue({ password: "old-pass-word" })

      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      )

      expect(usersRepository.save).toHaveBeenCalledTimes(1)
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input)
      expect(result).toEqual({ ok: true })
    })

    // 3.예외적인 문제가 발생할 경우
    it("should fail on exception", async () => {
      const editProfileArgs = {
        userId: 1,
        input: { email: "bs@new.com" },
      }

      usersRepository.findOne.mockRejectedValue(new Error())

      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      )

      expect(result).toEqual({
        ok: false,
        error: "Could not update profile.",
      })
    })
  })

  // Verify Email
  describe("verifyEmail", () => {
    // 1. 확인코드가 맞을 경우
    it("should verify email", async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      }

      verificationsRepository.findOne.mockResolvedValue(mockedVerification)

      const result = await service.verifyEmail("")

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1)
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      )

      expect(usersRepository.save).toHaveBeenCalledTimes(1)
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true })

      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1)
      expect(verificationsRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      )

      expect(result).toEqual({
        ok: true,
      })
    })

    // 2. 확인코드가 틀렸을 경우
    it("should fail on verification not found", async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined)

      const result = await service.verifyEmail("")
      expect(result).toEqual({ ok: false, error: "Verification not found." })
    })

    // 3. 예외적인 문제가 발생할 경우
    it("should fail on exception", async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error())

      const result = await service.verifyEmail("")

      expect(result).toEqual({ ok: false, error: "Could not verify email." })
    })
  })
})
