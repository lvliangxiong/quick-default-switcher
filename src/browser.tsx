import { useEffect, useState } from "react";
import { Icon, MenuBarExtra, getApplications, getDefaultApplication, open } from "@raycast/api";
import { exec } from "child_process";
import { error } from "console";


type Browser = { name: string, path: string, alias: string | undefined };

const useBrowsers = () => {
  const [state, setState] = useState<{ current: Browser; available: Browser[]; isLoading: boolean }>({
    current: { name: "", path: "", alias: "" },
    available: [],
    isLoading: true,
  });
  useEffect(() => {
    (async () => {
      const browsers = await getApplications().then(
        (apps) => {
          return apps.filter(
            (app) => supportedBrowsers.get(app.name) != undefined
          )
        }
      )

      setState({
        current: { name: "Chrome", path: "/Applications/Google Chrome.app", alias: "" },
        available: browsers.map(
          (browser) => {
            return { name: browser.name, path: browser.path, alias: supportedBrowsers.get(browser.name)?.alias }
          }
        ),
        isLoading: false,
      });
      // setState({
      //   current: { name: "Chrome", path: "/Applications/Google Chrome.app", alias: "" },
      //   available: [
      //     { name: "Safari", path: "/Applications/Safari.app", alias: "" },
      //     { name: "Chrome", path: "/Applications/Google Chrome.app", alias: "" },
      //     { name: "Edge", path: "/Applications/Microsoft Edge.app", alias: "" },
      //   ],
      //   isLoading: false,
      // });
    })();
  }, []);
  return state;
};

const supportedBrowsers = new Map([
  ["Safari", { name: "Safari", alias: "safari", }],
  ["Google Chrome", { name: "Google Chrome", alias: "chrome" }],
  ["Microsoft Edge", { name: "Microsoft Edge", alias: "edgemac" }],
])


export default function Command() {
  const { current: currentBrowser, available: availableBrowsers, isLoading } = useBrowsers();

  return (
    <MenuBarExtra icon={Icon.Lock} isLoading={isLoading}>
      {/* <MenuBarExtra.Section>
        <MenuBarExtra.Item title="Current" />
        {<MenuBarExtra.Item
          key={currentBrowser.name}
          icon={{ fileIcon: currentBrowser.path }}
          title={currentBrowser.name}
        />}
      </MenuBarExtra.Section> */}
      <MenuBarExtra.Section>
        <MenuBarExtra.Item title="Available" />
        {availableBrowsers.map((browser) => (
          <MenuBarExtra.Item
            key={browser.name}
            icon={{ fileIcon: browser.path }}
            title={browser.name}
            onAction={() => {
              exec(`defaultbrowser ${browser.alias}`, (err, stdout, stderr) => {
                console.log(`err: ${err}`)
                console.log(`stdout: ${stdout}`)
                console.log(`stderr: ${stderr}`)
              })
            }}
          />
        ))}
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
