# GTM CLI

GTM CLI 是以 Deno 和 Cliffy 建立的 Google Tag Manager 命令列工具。這個分支由 [dac-tech-team-tw](https://github.com/dac-tech-team-tw/gtm-cli) 維護，源自 [owntag/gtm-cli](https://github.com/owntag/gtm-cli)。可用來管理帳戶、容器、工作區及代碼等資源，也適合自動化與 CI/CD。

## 安裝

預先編譯的發行檔支援 macOS Apple Silicon／Intel、Linux x64 與 Windows x64。安裝腳本和 npm 安裝都需要本分支已有相應的 GitHub Release 資產。

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/dac-tech-team-tw/gtm-cli/main/install.sh | bash
```

### Windows x64

在 PowerShell 執行：

```powershell
irm https://raw.githubusercontent.com/dac-tech-team-tw/gtm-cli/main/install.ps1 | iex
```

腳本將 `gtm.exe` 安裝至 `%LOCALAPPDATA%\Programs\gtm`，並加入使用者 PATH；若其他終端機尚未取得新的 PATH，請重新開啟終端機。

### npm

`@dac-tech-team-tw/gtm-cli` 已發布至 npm。安裝時會下載套件版本對應的 GitHub Release 二進位檔，因此該版本的 Release 資產必須存在。

```bash
npm install -g @dac-tech-team-tw/gtm-cli
# 或指定已發布的版本
npm install -g @dac-tech-team-tw/gtm-cli@<版本>
```

### 手動下載或從原始碼建置

從本分支的 [GitHub Releases](https://github.com/dac-tech-team-tw/gtm-cli/releases) 下載對應檔案：

| 平台 | 檔案 |
| --- | --- |
| macOS Apple Silicon | `gtm-darwin-arm64` |
| macOS Intel | `gtm-darwin-x64` |
| Linux x64 | `gtm-linux-x64` |
| Windows x64 | `gtm-windows-x64.exe` |

macOS／Linux 可將下載檔重新命名為 `gtm`、使用 `chmod +x gtm` 賦予執行權限，再移至 PATH 中的目錄。Windows 可將檔案命名為 `gtm.exe` 並放入 PATH。

安裝 [Deno 2](https://deno.com/) 後，也可自行建置：

```bash
git clone https://github.com/dac-tech-team-tw/gtm-cli.git
cd gtm-cli
deno task compile
```

產生的執行檔為 `gtm`（Windows 為 `gtm.exe`）。原始碼建置的 OAuth 憑證需自行提供，詳見下方認證說明。

## 認證

### 瀏覽器 OAuth

```bash
gtm auth login
gtm auth status
```

登入流程會開啟瀏覽器，並使用 `http://localhost:8085/callback` 接收回呼。使用的 Google 帳戶必須具備所需的 GTM 權限。

自行建置或執行原始碼時，請在 Google Cloud 專案啟用 Tag Manager API，建立 OAuth 2.0 用戶端並設定 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`。若使用 Web application 類型，請將上述回呼網址加入授權重新導向 URI。執行 `deno task start` 時也可在專案根目錄的 `.env` 提供這些變數；已編譯程式則可使用執行環境變數。發行建置可由維護者在 CI 中嵌入用戶端憑證。

### 服務帳戶

啟用 Tag Manager API，建立服務帳戶及 JSON 金鑰，並在 GTM 中授予該服務帳戶所需的帳戶或容器權限：

```bash
gtm auth login --service-account /path/to/key.json
# 或設定環境變數，供後續指令使用
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
gtm accounts list
```

PowerShell 使用 `$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\key.json'`。此環境變數優先於其他認證方式；妥善保管金鑰，不要提交至版本庫。

```bash
gtm auth status
gtm auth logout
```

登出會清除已儲存的認證設定；服務帳戶金鑰檔不會被刪除，環境變數也不會被清除。

## 快速開始與設定

```bash
gtm --help
gtm accounts list
gtm containers list --account-id 123456
gtm workspaces list --account-id 123456 --container-id 789
gtm tags list --account-id 123456 --container-id 789 --workspace-id 1
```

可先執行互動式設定選擇預設帳戶、容器及工作區：

```bash
gtm config setup
gtm config get
gtm config set defaultAccountId 123456
gtm config set defaultContainerId 789
gtm config set defaultWorkspaceId 1
gtm config unset defaultWorkspaceId
```

可設定的鍵為 `defaultAccountId`、`defaultContainerId`、`defaultWorkspaceId` 和 `outputFormat`（`table`、`json`、`compact`）。各指令支援的選項與預設值可能不同，請用 `--help` 確認；部分操作即使設定預設值，仍要求明確提供資源 ID。

設定與認證檔預設位於 macOS／Linux 的 `~/.config/gtm-cli`，Windows 的 `%APPDATA%\gtm-cli`；可用 `GTM_CLI_CONFIG_DIR` 覆寫，也支援 `XDG_CONFIG_HOME`。請保護這些檔案中的憑證。

## 常用指令

以下假設已設定適當的預設帳戶、容器與工作區。實際可用操作及必要參數請參閱各指令的 `--help`。

```bash
# 容器與工作區
gtm containers list
gtm containers create --name "My Container" --type web
gtm workspaces list
gtm workspaces create --name "Feature Branch"
gtm workspaces status --workspace-id 1

# 工作區資源
gtm tags list --output json
gtm tags get --tag-id 42
gtm triggers list
gtm variables list
gtm folders list

# 容器版本：發布會變更正式環境
gtm version-headers list
gtm versions live
gtm versions create --name "Release"
gtm versions publish --version-id 42
```

其他指令群組包括 `environments`、`built-in-variables`、`clients`、`templates`、`transformations`、`zones`、`destinations`、`gtag-configs` 與 `user-permissions`。使用 `gtm <指令> --help` 查看操作；`gtm agent guide` 提供代理程式使用指南。許多清單或查詢指令接受 `--output json`、`table` 或 `compact`；`--quiet` 可減少非必要輸出，`--no-color` 可停用色彩。

```bash
gtm upgrade --check
gtm upgrade
```

`upgrade` 可檢查或安裝較新版本；升級依賴對應平台的 Release 資產。

## 開發

需要 Deno 2。從專案目錄執行：

```bash
deno task start --help       # 執行 CLI
deno task dev                # 監看檔案並執行
deno task check              # 型別檢查
deno task lint               # 靜態檢查
deno task fmt                # 格式化
deno task compile            # 建置目前平台的執行檔
```

`deno.json` 是 CLI 版本來源。需要 OAuth 時，請依認證章節設定本機環境變數或 `.env`；勿將憑證提交至版本庫。

## 發行與 npm trusted publishing

維護者可在乾淨的 `main` 分支執行以下其中一項（此操作會推送至 `origin`）：

```bash
deno task release patch
deno task release minor
deno task release major
deno task release 2.0.0
```

腳本會拉取 `origin/main`、同步更新 `deno.json` 與 `npm/package.json` 的版本、執行型別檢查、建立提交與 `v` 標籤，並推送分支及標籤。標籤會觸發 `.github/workflows/release.yml`，建置各平台二進位檔、建立 GitHub Release，並在資產上傳後透過 OIDC 發布 npm 套件。若要讓發行檔支援內建 OAuth，須先在 GitHub repository secrets 設定 `GOOGLE_CLIENT_ID` 與 `GOOGLE_CLIENT_SECRET`；請使用本分支自己的 Google OAuth 用戶端。

npm 發布前，維護者須擁有 `@dac-tech-team-tw` scope 的發布權限。在 npm 套件設定中新增 GitHub Actions trusted publisher，指定擁有者 `dac-tech-team-tw`、儲存庫 `gtm-cli` 與工作流程檔名 `release.yml`，並允許直接執行 `npm publish`；若工作流程使用受保護環境，也須指定相符的環境。新設定須在兩天內成功發布一次，否則會過期。OIDC 發布需要工作流程具備 `id-token: write` 權限及支援 trusted publishing 的 npm 版本。發布前亦須確認 npm 套件版本與 GitHub Release 資產相符。

## 授權與致謝

本專案採用 [MIT License](LICENSE)。原始專案由 owntag 建立；保留原始版權聲明：Copyright (c) 2026 owntag。使用、修改或散布時請遵守授權條款並保留所需的版權與授權聲明。
