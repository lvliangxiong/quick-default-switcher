import { useEffect, useState } from "react";
import { Icon, MenuBarExtra, getApplications, getDefaultApplication, open, showHUD } from "@raycast/api";
import { exec, execSync } from "child_process";


type Browser = { name: string, path: string, alias: string | undefined };

const DefaultBrowserCli = 'defaultbrowser'

const useBrowsers = () => {
  const [state, setState] = useState<{ current: Browser; available: Browser[]; isLoading: boolean }>({
    current: { name: "", path: "", alias: "" },
    available: [],
    isLoading: true,
  });
  useEffect(() => {
    (async () => {
      let browsers = await getApplications().then(
        (apps) => {
          return apps.filter(
            (app) => browserName2Alias.get(app.name) != undefined
          )
        }
      )

      const currentBrowserAlias = execSync(DefaultBrowserCli, { encoding: "utf-8" }).split('\n').find((sent) => sent.startsWith("* "))?.replace("* ", "")
      const currentBrowserName = browserAlias2Name.get(currentBrowserAlias ? currentBrowserAlias : "")
      const currentBrowser = browsers.find((browser) => browser.name === currentBrowserName)

      browsers = browsers.filter((browser) => browser.name !== currentBrowserName)

      setState({
        current: {
          name: currentBrowser === undefined ? "" : currentBrowser.name,
          path: currentBrowser === undefined ? "" : currentBrowser.path,
          alias: currentBrowserAlias
        },
        available: browsers.map(
          (browser) => {
            return { name: browser.name, path: browser.path, alias: browserName2Alias.get(browser.name) }
          }
        ),
        isLoading: false,
      });
    })();
  }, []);
  return state;
};

const browserAlias2Name = new Map(
  [
    ["safari", "Safari"],
    ["chrome", "Google Chrome"],
    ["edgemac", "Microsoft Edge"],
  ]
)

const browserName2Alias = new Map(
  [
    ["Safari", "safari"],
    ["Google Chrome", "chrome"],
    ["Microsoft Edge", "edgemac"],
  ]
)


export default function Command() {
  const { current: currentBrowser, available: availableBrowsers, isLoading } = useBrowsers();

  return (
    <MenuBarExtra icon={Icon.Lock} isLoading={isLoading}>
      <MenuBarExtra.Section>
        <MenuBarExtra.Item title="Current" />
        {
          <MenuBarExtra.Item
            key={currentBrowser.name}
            icon={{ fileIcon: currentBrowser.path }}
            title={currentBrowser.name}
            onAction={() => { }}
          />
        }
      </MenuBarExtra.Section>
      <MenuBarExtra.Section>
        <MenuBarExtra.Item title="Available" />
        {
          availableBrowsers.map(
            (browser) => (
              <MenuBarExtra.Item
                key={browser.name}
                icon={{ fileIcon: browser.path }}
                title={browser.name}
                onAction={
                  () => {
                    browser.alias &&
                      exec(
                        `${DefaultBrowserCli} ${browser.alias}`,
                        (err, stdout, stderr) => {
                          console.log(`err: ${err}`)
                          console.log(`stdout: ${stdout}`)
                          console.log(`stderr: ${stderr}`)
                        }
                      )
                  }
                }
              />
            )
          )
        }
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
