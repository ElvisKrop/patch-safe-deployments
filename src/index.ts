import fsExtra from 'fs-extra'

import { patchArgumentsFileName } from '~/constants'
import { PackageJSON, SafeAssetsJSON } from '~/types'
import { getFilesForPatching, getSafeContracts } from '~/utils'
import { PatchArgumentsSchema } from '~/validations'

import { exec } from 'child_process'
import * as path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

// =========================================================================
// ==================== Entry point of the script ==========================
// =========================================================================
;(async () => {
  try {
    console.log(`Starting script...`)

    // Check if file with arguments exists
    const scriptArgumentsFilePath = path.join(process.cwd(), patchArgumentsFileName)

    if (!(await fsExtra.pathExists(scriptArgumentsFilePath))) {
      throw new Error(`${patchArgumentsFileName} not found`)
    }

    // Read the arguments from the given file
    const scriptArgsRawData = await fsExtra.readJson(scriptArgumentsFilePath)
    const args = await PatchArgumentsSchema.strict().parseAsync(scriptArgsRawData)

    // Get target project root path
    const targetProjectRootPath = path.join(process.cwd(), '..', args.targetProjectFolderName)
    const packageJsonPath = path.join(targetProjectRootPath, 'package.json')
    const packageJsonValues: PackageJSON = await fsExtra.readJson(packageJsonPath)

    /** Check if target folder is nearby */ {
      const isTargetFolderNearby = await fsExtra.pathExists(packageJsonPath)
      if (!isTargetFolderNearby) {
        throw new Error('Target project folder not found')
      }
    }

    /** Install deps in the target project */ {
      const command = `cd ${targetProjectRootPath} && yarn`
      console.log(command)

      const logTitle = 'Installed dependencies'
      console.time(logTitle)
      const { stdout, stderr } = await execAsync(command)
      if (stderr) console.log(stderr)
      console.log(stdout)
      console.timeEnd(logTitle)
    }

    /** Add postinstall and patch-package deps */ {
      const devDependencies = Object.keys(packageJsonValues.devDependencies)

      const isPostinstallInstalled = devDependencies.includes('postinstall-postinstall')
      const isPatchPackageInstalled = devDependencies.includes('patch-package')

      let command = `cd ${targetProjectRootPath} && yarn add -D`

      if (!isPostinstallInstalled) command += ' postinstall-postinstall'
      if (!isPatchPackageInstalled) command += ' patch-package'

      if (!isPostinstallInstalled || !isPatchPackageInstalled) {
        console.log(command)

        const logTitle = 'Installed additional dependencies successfully'
        console.time(logTitle)
        const { stdout, stderr } = await execAsync(command)
        if (stderr) console.log(stderr)
        console.log(stdout)
        console.timeEnd(logTitle)
      } else {
        console.log(
          '\nBoth postinstall-postinstall and patch-package deps are already installed!\n',
        )
      }
    }

    /** Modify postinstall script, if needed */ {
      const postinstallScriptValue = packageJsonValues.scripts.postinstall

      if (postinstallScriptValue === undefined) {
        packageJsonValues.scripts.postinstall = 'patch-package'
      } else if (!postinstallScriptValue.startsWith('patch-package')) {
        packageJsonValues.scripts.postinstall = 'patch-package && '.concat(postinstallScriptValue)
      }

      await fsExtra.writeJson(packageJsonPath, packageJsonValues, {
        EOL: '\n',
        spaces: 2,
      })
    }

    const existingPackages = new Set<string>([])
    /** Update required files */ {
      const nodeModulesPath = path.join(targetProjectRootPath, 'node_modules')
      const { safeContractsVersion, singletonFactoryType } = args

      const filesToPatch = getFilesForPatching(safeContractsVersion)
      const safeContractsToInsert = getSafeContracts(
        safeContractsVersion,
        singletonFactoryType,
        args.customContracts,
      )

      for (const packageFile of filesToPatch) {
        const filePath = path.join(nodeModulesPath, packageFile)
        const pathExists = await fsExtra.pathExists(filePath)

        if (pathExists) {
          console.log('We are going to patch - ', filePath)
          const fileContent: SafeAssetsJSON = await fsExtra.readJson(filePath)

          const CHAIN_ID = args.chainId
          const fileName = filePath.split(path.sep)[filePath.split(path.sep).length - 1]

          switch (fileName) {
            case 'compatibility_fallback_handler.json':
              fileContent.networkAddresses[CHAIN_ID] =
                safeContractsToInsert.CompatibilityFallbackHandler
              break
            case 'create_call.json':
              fileContent.networkAddresses[CHAIN_ID] = safeContractsToInsert.CreateCall
              break
            case 'gnosis_safe.json':
            case 'safe.json':
              fileContent.networkAddresses[CHAIN_ID] = safeContractsToInsert.GnosisSafe
              break
            case 'gnosis_safe_l2.json':
            case 'safe_l2.json':
              fileContent.networkAddresses[CHAIN_ID] = safeContractsToInsert.GnosisSafeL2
              break
            case 'multi_send.json':
              fileContent.networkAddresses[CHAIN_ID] = safeContractsToInsert.MultiSend
              break
            case 'multi_send_call_only.json':
              fileContent.networkAddresses[CHAIN_ID] = safeContractsToInsert.MultiSendCallOnly
              break
            case 'proxy_factory.json':
            case 'safe_proxy_factory.json':
              fileContent.networkAddresses[CHAIN_ID] = safeContractsToInsert.GnosisSafeProxyFactory
              break
            case 'sign_message_lib.json':
              fileContent.networkAddresses[CHAIN_ID] = safeContractsToInsert.SignMessageLib
              break
            case 'simulate_tx_accessor.json':
              fileContent.networkAddresses[CHAIN_ID] = safeContractsToInsert.SimulateTxAccesor
              break
            case 'default_callback_handler.json':
              if (safeContractsToInsert.DefaultCallbackHandler) {
                fileContent.networkAddresses[CHAIN_ID] =
                  safeContractsToInsert.DefaultCallbackHandler
              }
              break
          }

          await fsExtra.writeJson(filePath, fileContent, {
            EOL: '\n',
            spaces: packageFile.includes('dist') ? 4 : 2,
          })

          existingPackages.add(
            packageFile
              .replace('/node_modules', '')
              .replace(`/src/assets/v1.3.0/${fileName}`, '')
              .replace(`/src/assets/v1.4.1/${fileName}`, '')
              .replace(`/dist/assets/v1.3.0/${fileName}`, '')
              .replace(`/dist/assets/v1.4.1/${fileName}`, ''),
          )
        }
      }
    }

    /** Perform patching */ {
      const command =
        `cd ${targetProjectRootPath} && npx patch-package ` + Array.from(existingPackages).join(' ')
      console.log(command)

      const logTitle = 'Patching dependencies'
      console.time(logTitle)
      const patchingResults = await execAsync(command)
      console.log(patchingResults.stdout)
      if (patchingResults.stderr) {
        console.log(patchingResults.stderr)
      }
      console.timeEnd(logTitle)
    }

    console.log('\nScript finished!')
    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
})()
