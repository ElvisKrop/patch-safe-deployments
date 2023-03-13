export interface PackageJSON {
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
