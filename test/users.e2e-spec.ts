import * as request from "supertest"
import { getConnection } from "typeorm"
import { AppModule } from "../src/app.module"
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

const GRAPHQL_ENDPOINT = "/graphql"

describe("UserModule (e2e)", () => {
  let app: INestApplication

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

  // Describe
  describe("createAccount", () => {
    const EMAIL = "nico@las.com"

    it("should create account", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation{
            createAccount(
              input:{
                email:"${EMAIL}",
                password:"test.password",
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
  })
  it.todo("userProfile")
  it.todo("login")
  it.todo("me")
  it.todo("verifyEmail")
  it.todo("editProfile")
})
