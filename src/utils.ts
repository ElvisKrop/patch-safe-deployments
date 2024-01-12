import { fileNames, packagesWithSafeDeployments, SAFE_CONTRACTS } from '~/constants'
import { PatchArgumentsType, SafeContracts, SafeContractsVersion } from '~/types'
import { SafeContractsSchema } from '~/validations'

export function getFilesForPatching(targetSafeContractsVersion: SafeContractsVersion): string[] {
  return packagesWithSafeDeployments
    .reduce<string[]>((acc, val) => {
      switch (val.length) {
        case 1:
          acc.push(
            `${val[0]}/src/assets/v${targetSafeContractsVersion}`,
            `${val[0]}/dist/assets/v${targetSafeContractsVersion}`,
          )
          break
        case 2:
          acc.push(
            `${val[0]}/node_modules/${val[1]}/src/assets/v${targetSafeContractsVersion}`,
            `${val[0]}/node_modules/${val[1]}/dist/assets/v${targetSafeContractsVersion}`,
          )
          break
        default:
          throw new Error(`[getFilesForPatching]: Unexpected length of packages`)
      }

      return acc
    }, [])
    .reduce<string[]>((acc, path) => {
      acc.push(...fileNames.map((fileName) => `${path}/${fileName}`))
      return acc
    }, [])
}

export function getSafeContracts(
  safeContractsVersion: SafeContractsVersion,
  singletonFactoryType: PatchArgumentsType['singletonFactoryType'],
  override?: Partial<SafeContracts>,
): SafeContracts {
  switch (singletonFactoryType) {
    case 'safe':
    case 'default':
      return {
        ...SAFE_CONTRACTS[safeContractsVersion][singletonFactoryType],
        ...override,
      }
    default:
      return SafeContractsSchema.strict().parse(override)
  }
}
