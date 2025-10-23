import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Account from "@/models/Account";
import Brand from "@/models/Brand";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, brandId } = body;

    if (!accountId || !brandId) {
      return NextResponse.json(
        { success: false, message: "Account ID and Brand ID are required" },
        { status: 400 }
      );
    }

    // Connect to database and fetch account & brand details
    await connectDB();
    
    const account = await Account.findById(accountId);
    const brand = await Brand.findById(brandId).populate('sellerCentralAccountId');

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    if (!brand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 }
      );
    }

    console.log(`🚀 Triggering scraper for Account: ${account.accountName}, Brand: ${brand.brandName}`);

    // Dynamically import child_process to avoid static analysis
    const { spawn } = await import("child_process");
    const { join } = await import("path");
    
    // Construct worker paths dynamically
    const cwd = process.cwd();
    const workerFolder = "worker";
    const scriptFile = "seller-central-login.js";
    const workerDir = join(cwd, workerFolder);
    const workerScript = join(cwd, workerFolder, scriptFile);
    
    // Spawn the worker process
    const workerProcess = spawn("node", [workerScript], {
      cwd: workerDir,
      env: {
        ...process.env,
        BRAND_URL: brand.brandUrl,
        BRAND_NAME: brand.brandName,
        ACCOUNT_NAME: account.accountName,
        HEADLESS: "false", // Keep browser visible
      },
      detached: true,
      stdio: "ignore"
    });

    // Detach the process so it runs independently
    workerProcess.unref();

    return NextResponse.json({
      success: true,
      message: "Scraper started successfully",
      data: {
        accountName: account.accountName,
        brandName: brand.brandName,
      },
    });
  } catch (error: any) {
    console.error("Error starting scraper:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to start scraper" },
      { status: 500 }
    );
  }
}

