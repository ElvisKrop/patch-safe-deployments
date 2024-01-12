import { z } from 'zod'

export const SingletonFactoryTypeSchema = z.enum(['safe', 'default'])

export const SafeContractsVersionSchema = z.enum(['1.3.0', '1.4.1'])

export const SafeContractsSchema = z.object({
  CompatibilityFallbackHandler: z.string(),
  CreateCall: z.string(),
  DefaultCallbackHandler: z.string().optional(),
  GnosisSafe: z.string(),
  GnosisSafeL2: z.string(),
  MultiSend: z.string(),
  MultiSendCallOnly: z.string(),
  GnosisSafeProxyFactory: z.string(),
  SignMessageLib: z.string(),
  SimulateTxAccesor: z.string(),
})

export const PatchArgumentsSchema = z.object({
  targetProjectFolderName: z.string(),
  chainId: z.string(),
  singletonFactoryType: SingletonFactoryTypeSchema.or(z.null()),
  safeContractsVersion: SafeContractsVersionSchema,
  customContracts: SafeContractsSchema.optional(),
})
