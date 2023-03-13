const packages: Array<[string] | [string, string]> = [
  ['@gnosis.pm/safe-deployments'],
  ['@safe-global/safe-deployments'],
  ['@safe-global/safe-core-sdk', '@gnosis.pm/safe-deployments'],
  ['@safe-global/safe-core-sdk-types', '@gnosis.pm/safe-deployments'],
]

const fileNames = Object.freeze([
  'compatibility_fallback_handler.json',
  'create_call.json',
  'gnosis_safe.json',
  'gnosis_safe_l2.json',
  'multi_send.json',
  'multi_send_call_only.json',
  'proxy_factory.json',
  'sign_message_lib.json',
  'simulate_tx_accessor.json',
] as const)

export const filesToPatch = Object.freeze(
  packages
    .reduce<string[]>((acc, val) => {
      switch (val.length) {
        case 1:
          return [
            ...acc,
            `${val[0]}/src/assets/v1.3.0`,
            `${val[0]}/dist/assets/v1.3.0`,
          ]
        case 2:
          return [
            ...acc,
            `${val[0]}/node_modules/${val[1]}/src/assets/v1.3.0`,
            `${val[0]}/node_modules/${val[1]}/dist/assets/v1.3.0`,
          ]
      }
    }, [])
    .reduce<string[]>(
      (acc, val) => [
        ...acc,
        ...fileNames.map((fileName) => `${val}/${fileName}`),
      ],
      [],
    ),
)
