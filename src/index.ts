import fsExtra from 'fs-extra'

import { filesToPatch } from '@/constants'
import { Arguments, PackageJSON } from '@/types'

import childProcess from 'child_process'
import * as path from 'path'
import { promisify } from 'util'

const exec = promisify(childProcess.exec)

// =========================================================================
// ==================== Entry point of the script ==========================
// =========================================================================
;(async () => {
  try {
    console.log(`Starting script...`)
    const scriptArgumentsFileName = path.join(
      process.cwd(),
      'patch-arguments.json',
    )
    if (!(await fsExtra.pathExists(scriptArgumentsFileName))) {
      throw new Error('patch-arguments.json not found')
    }

    const args: Arguments = await fsExtra.readJson(scriptArgumentsFileName)

    const targetProjectRootPath = path.join(
      process.cwd(),
      '..',
      args.targetProjectFolderName,
    )
    const packageJsonPath = path.join(targetProjectRootPath, 'package.json')

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
      const { stdout, stderr } = await exec(command)
      if (stderr) console.log(stderr)
      console.log(stdout)
      console.timeEnd(logTitle)
    }

    /** Add postinstall and patch-package deps */ {
      const packageJsonValues: PackageJSON = await fsExtra.readJson(
        packageJsonPath,
      )

      const isPostinstallInstalled =
        packageJsonValues.devDependencies['postinstall-postinstall'] !==
        undefined
      const isPatchPackageInstalled =
        packageJsonValues.devDependencies['patch-package'] !== undefined

      let command = `cd ${targetProjectRootPath} && yarn add -D`

      if (!isPostinstallInstalled) command += ' postinstall-postinstall'
      if (!isPatchPackageInstalled) command += ' patch-package'

      if (!isPostinstallInstalled || !isPatchPackageInstalled) {
        console.log(command)

        const logTitle = 'Installed additional dependencies'
        console.time(logTitle)
        const { stdout, stderr } = await exec(command)
        if (stderr) console.log(stderr)
        console.log(stdout)
        console.timeEnd(logTitle)
      } else {
        console.log(
          '\nBoth postinstall-postinstall and patch-package deps are already installed!\n',
        )
      }
    }

    /** Modify postinstall script. if needed */ {
      const packageJsonValues: PackageJSON = await fsExtra.readJson(
        packageJsonPath,
      )
      const postinstallScriptValue = packageJsonValues.scripts.postinstall

      if (postinstallScriptValue === undefined) {
        packageJsonValues.scripts.postinstall = 'patch-package'
      } else if (!postinstallScriptValue.startsWith('patch-package')) {
        packageJsonValues.scripts.postinstall = 'patch-package && '.concat(
          postinstallScriptValue,
        )
      }

      await fsExtra.writeJson(packageJsonPath, packageJsonValues, {
        EOL: '\n',
        spaces: 2,
      })
    }

    const existingPackages = new Set<string>([])
    /** Update required files */ {
      const nodeModulesPath = path.join(targetProjectRootPath, 'node_modules')

      for (const packageFile of filesToPatch) {
        const filePath = path.join(nodeModulesPath, packageFile)
        const pathExists = await fsExtra.pathExists(filePath)

        if (pathExists) {
          console.log('We are going to patch -', filePath)
          const content = await fsExtra.readJson(filePath)

          const CHAIN_ID = args.chainId
          const fileName = filePath.split(path.sep)[
            filePath.split(path.sep).length - 1
          ]

          switch (fileName) {
            case 'compatibility_fallback_handler.json':
              content.networkAddresses[CHAIN_ID] =
                args.CompatibilityFallbackHandler
              break
            case 'create_call.json':
              content.networkAddresses[CHAIN_ID] =
                args.CompatibilityFallbackHandler
              break
            case 'gnosis_safe.json':
              content.networkAddresses[CHAIN_ID] = args.GnosisSafe
              break
            case 'gnosis_safe_l2.json':
              content.networkAddresses[CHAIN_ID] = args.GnosisSafeL2
              break
            case 'multi_send.json':
              content.networkAddresses[CHAIN_ID] = args.MultiSend
              break
            case 'multi_send_call_only.json':
              content.networkAddresses[CHAIN_ID] = args.MultiSendCallOnly
              break
            case 'proxy_factory.json':
              content.networkAddresses[CHAIN_ID] = args.GnosisSafeProxyFactory
              break
            case 'sign_message_lib.json':
              content.networkAddresses[CHAIN_ID] = args.SignMessageLib
              break
            case 'simulate_tx_accessor.json':
              content.networkAddresses[CHAIN_ID] = args.SimulateTxAccesor
              break
          }

          await fsExtra.writeJson(filePath, content, {
            EOL: '\n',
            spaces: packageFile.includes('dist') ? 4 : 2,
          })

          existingPackages.add(
            packageFile
              .replace('/node_modules', '')
              .replace(`/src/assets/v1.3.0/${fileName}`, '')
              .replace(`/dist/assets/v1.3.0/${fileName}`, ''),
          )
        }
      }
    }

    /** Perform patching */ {
      const command =
        `cd ${targetProjectRootPath} && npx patch-package ` +
        Array.from(existingPackages).join(' ')
      console.log(command)

      const logTitle = 'Patching dependencies'
      console.time(logTitle)
      const patchingResults = await exec(command)
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
