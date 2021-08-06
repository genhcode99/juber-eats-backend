import * as request from "supertest"
import { getConnection } from "typeorm"
import { AppModule } from "../src/app.module"
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

jest.mock("got", () => {
  return {
    post: jest.fn(),
  }
})

const GRAPHQL_ENDPOINT = "/graphql"

describe("UserModule (e2e)", () => {
  let app: INestApplication
  let jwtToken: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = module.createNestApplication()
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
  it.todo("userProfile")
  it.todo("me")
  it.todo("verifyEmail")
  it.todo("editProfile")
})
