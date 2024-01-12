import { SafeContracts, SafeContractsVersion, SingletonFactoryType } from '~/types'

export const packagesWithSafeDeployments: Array<[string] | [string, string]> = [
  ['@safe-global/safe-core-sdk', '@safe-global/safe-deployments'],
  ['@safe-global/safe-core-sdk-types', '@safe-global/safe-deployments'],
  ['@safe-global/safe-deployments'],
]

export const fileNames = Object.freeze([
  'compatibility_fallback_handler.json',
  'create_call.json',
  'gnosis_safe.json',
  'gnosis_safe_l2.json',
  'multi_send.json',
  'multi_send_call_only.json',
  'safe.json',
  'safe_l2.json',
  'proxy_factory.json',
  'safe_proxy_factory.json',
  'sign_message_lib.json',
  'simulate_tx_accessor.json',
  'default_callback_handler.json',
] as const)

export const patchArgumentsFileName = 'patch-arguments.json'

export const SAFE_CONTRACTS: Record<
  SafeContractsVersion,
  Record<SingletonFactoryType, SafeContracts>
> = {
  '1.3.0': {
    safe: {
      CompatibilityFallbackHandler: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
      CreateCall: '0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d',
      DefaultCallbackHandler: '0x3d8E605B02032A941Cfe26897Ca94d77a5BC24b3',
      GnosisSafe: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938',
      GnosisSafeL2: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA',
      MultiSend: '0x998739BFdAAdde7C933B942a68053933098f9EDa',
      MultiSendCallOnly: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B',
      GnosisSafeProxyFactory: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC',
      SignMessageLib: '0x98FFBBF51bb33A056B08ddf711f289936AafF717',
      SimulateTxAccesor: '0x727a77a074D1E6c4530e814F89E618a3298FC044',
    },
    default: {
      CompatibilityFallbackHandler: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4',
      CreateCall: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4',
      DefaultCallbackHandler: '0x1AC114C2099aFAf5261731655Dc6c306bFcd4Dbd',
      GnosisSafe: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
      GnosisSafeL2: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
      GnosisSafeProxyFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
      MultiSend: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
      MultiSendCallOnly: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
      SignMessageLib: '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2',
      SimulateTxAccesor: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da',
    },
  },
  '1.4.1': {
    safe: {
      CompatibilityFallbackHandler: '0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99',
      CreateCall: '0x9b35Af71d77eaf8d7e40252370304687390A1A52',
      DefaultCallbackHandler: '',
      GnosisSafe: '0x41675C099F32341bf84BFc5382aF534df5C7461a',
      GnosisSafeL2: '0x29fcB43b46531BcA003ddC8FCB67FFE91900C762',
      MultiSend: '0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526',
      MultiSendCallOnly: '0x9641d764fc13c8B624c04430C7356C1C7C8102e2',
      GnosisSafeProxyFactory: '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67',
      SignMessageLib: '0xd53cd0aB83D845Ac265BE939c57F53AD838012c9',
      SimulateTxAccesor: '0x3d4BA2E0884aa488718476ca2FB8Efc291A46199',
    },
    // TODO: fill the addresses if such exist
    default: {
      CompatibilityFallbackHandler: '',
      CreateCall: '',
      DefaultCallbackHandler: '',
      GnosisSafe: '',
      GnosisSafeL2: '',
      MultiSend: '',
      MultiSendCallOnly: '',
      GnosisSafeProxyFactory: '',
      SignMessageLib: '',
      SimulateTxAccesor: '',
    },
  },
}
