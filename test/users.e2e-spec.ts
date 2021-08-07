import * as request from "supertest"
import { getConnection, Repository } from "typeorm"
import { AppModule } from "../src/app.module"
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { User } from "src/users/entities/user.entity"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Verification } from "src/users/entities/verification.entity"
import { isRef } from "joi"

jest.mock("got", () => {
  return {
    post: jest.fn(),
  }
})

const GRAPHQL_ENDPOINT = "/graphql"

describe("UserModule (e2e)", () => {
  let app: INestApplication
  let userRepository: Repository<User>
  let verificationRepository: Repository<Verification>
  let jwtToken: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    verificationRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    )
    await app.init()
  })

  afterAll(async () => {
    await getConnection().dropDatabase()
    app.close()
  })

  const testUser = {
    email: "nico@las.com",
    password: "test.password",
  }

  // Describe
  describe("createAccount", () => {
    // 1. 유저 계정이 만들어졌을 경우
    it("should create account", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation{
            createAccount(
              input:{
                email:"${testUser.email}",
                password:"${testUser.password}",
                role:Client
              }){
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBeTruthy()
          expect(res.body.data.createAccount.error).toBe(null)
        })
    })

    // 2. 이미 email 이 존재하는 경우
    it("should fail if account already exists", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation{
            createAccount(
              input:{
                email:"${testUser.email}",
                password:"${testUser.password}",
                role:Client
              }){
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBeFalsy()
          expect(res.body.data.createAccount.error).toEqual(
            "There is a user with that email already",
          )
        })
    })
  })

  // Login
  describe("login", () => {
    // 1. 로그인 되었을 경우
    it("should login with correct credentials", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation{
              login(
                input:{
                  email:"${testUser.email}",
                  password:"${testUser.password}"
                }
              )
              {
                ok
                error
                token
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res
          expect(login.ok).toBeTruthy()
          expect(login.error).toBe(null)
          expect(login.token).toEqual(expect.any(String))
          jwtToken = login.token
        })
    })

    // 2. 비밀번호가 틀렸을 경우
    it("should not be abled to login with wrong credentials", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation{
              login(
                input:{
                  email:"${testUser.email}",
                  password:"WrongPassword"
                }
              )
              {
                ok
                error
                token
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res
          expect(login.ok).toBeFalsy()
          expect(login.error).toBe("Wrong password")
          expect(login.token).toBe(null)
        })
    })
  })

  // User Profile
  describe("userProfile", () => {
    let userId: number

    beforeAll(async () => {
      const [user] = await userRepository.find()
      userId = user.id
    })

    // 1. 유저를 찾았을 경우
    it("should see a user's profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set("X-JWT", jwtToken)
        .send({
          query: `
            query{
              userProfile(userId:${userId}){
                ok
                error
                user{
                  id
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res
          expect(ok).toBeTruthy()
          expect(error).toBe(null)
          expect(id).toBe(userId)
        })
    })

    // 2. 유저를 찾지 못했을 경우
    it("should not find a profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set("X-JWT", jwtToken)
        .send({
          query: `
            query{
              userProfile(userId:9999){
                ok
                error
                user{
                  id
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res
          expect(ok).toBeFalsy()
          expect(error).toBe("User Not Found")
          expect(user).toBe(null)
        })
    })
  })

  // Me
  describe("me", () => {
    // 1. 로그인 되어있는 상태에서 유저를 볼 경우
    it("should find my profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set("X-JWT", jwtToken)
        .send({
          query: `
            query{
              me{
                email
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res
          expect(email).toBe(testUser.email)
        })
    })

    // 2. 로그인 되어있지 않은 상태에서 유저를 볼 경우
    it("should not allow logged out user", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            query{
              me{
                email
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res
          const [error] = errors
          expect(error.message).toBe("Forbidden resource")
        })
    })
  })

  // Edit Profile
  describe("editProfile", () => {
    // 1. 이메일 변경
    it("should change email", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set("X-JWT", jwtToken)
        .send({
          query: `
            mutation{
              editProfile(input:{email:"new@email.com"}){
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res
          expect(ok).toBeTruthy()
          expect(error).toBe(null)
        })
    })

    // 2. 이메일이 변경 되었는지 확인
    it("should have new email", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set("X-JWT", jwtToken)
        .send({
          query: `
      query{
        me{
          email
        }
      }
    `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res
          expect(email).toBe("new@email.com")
        })
    })
  })

  // Verify Email
  describe("verifyEmail", () => {
    let verificationCode: string

    beforeAll(async () => {
      const [verification] = await verificationRepository.find()
      verificationCode = verification.code
    })

    // 1. 코드가 맞을 경우
    it("should verify email", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation{
              verifyEmail(
                input:{
                  code:"${verificationCode}"
                }){
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res
          expect(ok).toBeTruthy()
          expect(error).toBe(null)
        })
    })

    // 2. 코드가 틀렸을 경우
    it("should fail on verification code not found", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation{
              verifyEmail(
                input:{
                  code:"WrongCode"
                }){
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res
          expect(ok).toBeFalsy()
          expect(error).toBe("Verification not found.")
        })
    })
  })
})
