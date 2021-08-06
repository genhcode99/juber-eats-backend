import * as jwt from "jsonwebtoken"
import { Test } from "@nestjs/testing"
import { JwtService } from "./jwt.service"
import { CONFIG_OPTIONS } from "src/common/common.constants"

jest.mock("jsonwebtoken", () => {
  return {
    sign: jest.fn(() => "TOKEN"),
  }
})

const TEST_KEY = "testKey"

describe("JwtService", () => {
  let service: JwtService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile()
    service = module.get<JwtService>(JwtService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("sign", () => {
    it("shoud return a signed token", async () => {
      const ID = 1
      const token = service.sign(ID)

      expect(typeof token).toBe("string")
      expect(jwt.sign).toHaveBeenCalledTimes(1)
      expect(jwt.sign).toHaveBeenCalledWith({ id: ID }, TEST_KEY)
    })
  })

  describe("verify", () => {
    it("should return the decoded token", () => {})
  })
})
