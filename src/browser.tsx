import { useEffect, useState } from "react";
import { Application, MenuBarExtra, confirmAlert, getApplications } from "@raycast/api";
import { execSync } from "child_process";

type Browser = { name: string; path: string; alias: string | undefined };

const DefaultBrowserCli = "defaultbrowser";

const useBrowsers = () => {
  const [state, setState] = useState<{ current: Browser; available: Browser[]; cliErr: string; isLoading: boolean }>({
    current: { name: "", path: "", alias: "" },
    available: [],
    cliErr: "",
    isLoading: true,
  });
  useEffect(() => {
    (async () => {
      let browsers = await getApplications().then((apps) => {
        return apps.filter((app) => browserName2Alias.get(app.name) != undefined);
      });

      let currentBrowser: Application | undefined;
      let currentBrowserAlias: string | undefined;
      let cliErr: string = "";

      try {
        currentBrowserAlias = execSync(DefaultBrowserCli, { encoding: "utf-8" })
          .split("\n")
          .find((sent) => sent.startsWith("* "))
          ?.replace("* ", "");
        const currentBrowserName = browserAlias2Name.get(currentBrowserAlias ? currentBrowserAlias : "");
        currentBrowser = browsers.find((browser) => browser.name === currentBrowserName);

        browsers = browsers.filter((browser) => browser.name !== currentBrowserName);
      } catch (err: any) {
        console.log(err.message);
        cliErr = err;
      }

      console.log(browsers);

      setState({
        current: {
          name: currentBrowser === undefined ? "" : currentBrowser.name,
          path: currentBrowser === undefined ? "" : currentBrowser.path,
          alias: currentBrowserAlias,
        },
        available: browsers.map((browser) => {
          return { name: browser.name, path: browser.path, alias: browserName2Alias.get(browser.name) };
        }),
        cliErr: cliErr,
        isLoading: false,
      });
    })();
  }, []);
  return state;
};

const browserAlias2Name = new Map([
  ["safari", "Safari"],
  ["chrome", "Google Chrome"],
  ["edgemac", "Microsoft Edge"],
]);

const browserName2Alias = new Map([
  ["Safari", "safari"],
  ["Google Chrome", "chrome"],
  ["Microsoft Edge", "edgemac"],
]);

export default function Command() {
  const { current: currentBrowser, available: availableBrowsers, cliErr, isLoading } = useBrowsers();

  return (
    <MenuBarExtra icon={"browser-icon.png"} isLoading={isLoading}>
      {cliErr.length === 0 && (
        <MenuBarExtra.Section>
          <MenuBarExtra.Item title={"Current"} />
          <MenuBarExtra.Item
            key={currentBrowser.name}
            icon={{ fileIcon: currentBrowser.path }}
            title={currentBrowser.name}
            onAction={() => {}}
          />
        </MenuBarExtra.Section>
      )}

      <MenuBarExtra.Section>
        <MenuBarExtra.Item title="Available" />
        {availableBrowsers.map((browser) => (
          <MenuBarExtra.Item
            key={browser.name}
            icon={{ fileIcon: browser.path }}
            title={browser.name}
            onAction={() => {
              try {
                execSync(`${DefaultBrowserCli} ${browser.alias}`);
              } catch (err: any) {
                confirmAlert({ title: "Something went wrong!", message: err.message });
              }
            }}
          />
        ))}
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
