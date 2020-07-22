
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'

const cert = `-----BEGIN CERTIFICATE-----
MIIDCTCCAfGgAwIBAgIJKGwERAGRmTYMMA0GCSqGSIb3DQEBCwUAMCIxIDAeBgNV
BAMTF3VkYWdyYW1zYW0udXMuYXV0aDAuY29tMB4XDTIwMDcxNDIxMTExOVoXDTM0
MDMyMzIxMTExOVowIjEgMB4GA1UEAxMXdWRhZ3JhbXNhbS51cy5hdXRoMC5jb20w
ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCsJpVsn8CPTU/hXlll6C3u
Y4Hwm5LDW7cEZ2+2t+LejgUzBma/wIMz7M/PaAJW+/O2um0rjC32Q/6asNAxioqW
B1jFArFhnC+pkW0s1rDEqH2txR4D/OjhA8B5JJo6i9glGeaWkY1ww/rZMOC/SafR
P9wy1OTCzVsEJ8K/t4sElSr9WKP1ZiCeIZCocMo93UjjCdzmVCLXxqqBglKmXZvo
rtFTjxmgEh791vzKT7ow+52RroBnLdnYj+3TZnGaz4Vf93oQ8gqokWMqAtwkr5Eu
jbos1qWZf2z+3WuWLn371XCP/f8W5dMuHrxcyNhqyJFhdCpCn18FeuLsJhQ8xhXh
AgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFNCBACVsrL9ta0EH
nuJfPQBaIpbnMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAertk
FpIslJ4dz4vqKz6XAOci/pSRt+zi4PN1boB+b36VZm64/M+LpjsFE9KV+N1dXi6s
Hy0oYBHztvZP9CghKiGTEL7iZP/LiSnX2qLwkxF6JR9aTgbnE9P7xc3j7Tv9bOWM
YveQPP6U2jaWd4h5ikN92eXXCm/3QOnd6r/X99F64DLEvdQpZjNkg2jgPg8NF8jb
6iLEyFir/2HbtrbvGaHXOynb7VBIn69JI5wZKTK6e0BfLgvv44Hvg56VZvOWPgwv
TrZZQvwbfruU2FDQphdE1N6FsOLpkkAqGbALg6zvE+lENgkTuuvJMmudmNGwszPW
Yid5UfiSKahBiAWVrg==
-----END CERTIFICATE-----
`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const JwtPayload = verifyToken(event.authorizationToken)
    console.log('User was authorized', JwtPayload)

    return {
      principalId: JwtPayload.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}
