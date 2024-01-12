import { z } from 'zod'

import {
  PatchArgumentsSchema,
  SafeContractsSchema,
  SafeContractsVersionSchema,
  SingletonFactoryTypeSchema,
} from '~/validations'

export type SafeContractsVersion = z.TypeOf<typeof SafeContractsVersionSchema>
export type SafeContracts = z.TypeOf<typeof SafeContractsSchema>
export type SingletonFactoryType = z.TypeOf<typeof SingletonFactoryTypeSchema>

export type PatchArgumentsType = z.TypeOf<typeof PatchArgumentsSchema>

export interface PackageJSON extends Record<string, unknown> {
  version: string
  scripts: Record<string, string>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

export interface Arguments {
  targetProjectFolderName: string
  chainId: string
  CompatibilityFallbackHandler: string
  CreateCall: string
  GnosisSafe: string
  GnosisSafeL2: string
  MultiSend: string
  MultiSendCallOnly: string
  GnosisSafeProxyFactory: string
  SignMessageLib: string
  SimulateTxAccesor: string
}
