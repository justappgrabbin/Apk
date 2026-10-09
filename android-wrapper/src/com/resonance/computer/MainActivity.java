package com.resonance.computer;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

public class MainActivity extends Activity {
  private static final int REQ_PERMS = 321;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    if (android.os.Build.VERSION.SDK_INT >= 23) {
      requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA}, REQ_PERMS);
    }

    WebView web = new WebView(this);
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setAllowFileAccess(true);
    s.setAllowContentAccess(true);
    s.setAllowFileAccessFromFileURLs(true);
    s.setAllowUniversalAccessFromFileURLs(true);
    s.setDomStorageEnabled(true);
    s.setDatabaseEnabled(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    web.setWebViewClient(new WebViewClient());
    web.setWebChromeClient(new WebChromeClient() {
      @Override
      public void onPermissionRequest(final PermissionRequest request) {
        runOnUiThread(() -> request.grant(request.getResources()));
      }
    });
    setContentView(web);

    File dest = new File(getFilesDir(), "payload");
    copyAssetTree("payload", dest);
    File index = new File(dest, "index.html");
    if (index.exists()) {
      web.loadUrl("file://" + index.getAbsolutePath());
    } else {
      web.loadData("<html><body><h1>Synthia Whole Computer</h1><p>index.html missing</p></body></html>", "text/html", "utf-8");
    }
  }

  private void copyAssetTree(String assetDir, File destDir) {
    destDir.mkdirs();
    try {
      String[] kids = getAssets().list(assetDir);
      if (kids == null || kids.length == 0) {
        copyOne(assetDir, new File(destDir.getParentFile(), new File(assetDir).getName()));
        return;
      }
      for (String name : kids) {
        String child = assetDir + "/" + name;
        String[] sub = getAssets().list(child);
        if (sub != null && sub.length > 0) {
          copyAssetTree(child, new File(destDir, name));
        } else {
          copyOne(child, new File(destDir, name));
        }
      }
    } catch (Exception ignored) {}
  }

  private void copyOne(String assetPath, File dest) {
    try {
      InputStream in = getAssets().open(assetPath);
      dest.getParentFile().mkdirs();
      OutputStream out = new FileOutputStream(dest);
      byte[] buf = new byte[8192];
      int n;
      while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
      in.close();
      out.close();
    } catch (Exception ignored) {}
  }
}
