import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { authenticator } from 'otplib';
import mongoose from 'mongoose';
import fs from 'fs';
import connectDB from './lib/mongodb.js';
import Account from './models/Account.js';
import Brand from './models/Brand.js';
import PuppeteerConfig from './models/PuppeteerConfig.js';
import { decrypt } from './lib/crypto.js';

// Load environment variables
dotenv.config();

// Utility function to wait for a specified time
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Configuration (will be populated from MongoDB)
const CONFIG = {
  // TRIGGER PARAMETERS (set dynamically by API or manual run)
  // These tell us WHICH data to fetch from MongoDB
  brandId: process.env.BRAND_ID,    // Brand ID to process (set by API trigger)
  accountId: process.env.ACCOUNT_ID, // Account ID to process (alternative to brandId)
  
  // CREDENTIALS (fetched from MongoDB based on brandId/accountId)
  username: null,
  password: null,
  twoFAKey: null,
  accountName: null,
  
  // BRAND DATA (fetched from MongoDB)
  brands: {},
  brandUrl: null,
  brandName: null,
  
  // PUPPETEER SETTINGS (fetched from MongoDB, can be overridden by env vars for testing)
  headless: true,
  timeout: 180000,
  sellerCentralUrl: 'https://sellercentral.amazon.com/home',
};

/**
 * Fetch account credentials from MongoDB
 */
async function fetchAccountFromDB(accountId) {
  try {
    console.log(`🔍 Fetching account from MongoDB (ID: ${accountId})...`);
    
    const account = await Account.findById(accountId)
      .select('+password +twoFAKey'); // Include password and twoFAKey fields
    
    if (!account) {
      throw new Error(`Account not found with ID: ${accountId}`);
    }
    
    console.log(`✅ Found account: ${account.accountName}`);
    console.log(`🔓 Decrypting credentials...`);
    
    // Decrypt password and 2FA key
    const decryptedPassword = decrypt(account.password);
    const decryptedTwoFAKey = decrypt(account.twoFAKey);
    
    return {
      accountName: account.accountName,
      username: account.username,
      password: decryptedPassword,
      twoFAKey: decryptedTwoFAKey,
    };
  } catch (error) {
    console.error('❌ Failed to fetch account from MongoDB:', error.message);
    throw error;
  }
}

/**
 * Fetch brands for an account from MongoDB
 */
async function fetchBrandsFromDB(accountId) {
  try {
    console.log(`🔍 Fetching brands for account from MongoDB...`);
    
    const brands = await Brand.find({ sellerCentralAccountId: accountId });
    
    console.log(`✅ Found ${brands.length} brand(s)`);
    
    const brandsMap = {};
    brands.forEach(brand => {
      brandsMap[brand.brandName] = brand.brandUrl;
    });
    
    return brandsMap;
  } catch (error) {
    console.error('❌ Failed to fetch brands from MongoDB:', error.message);
    throw error;
  }
}

/**
 * Fetch a specific brand from MongoDB
 */
async function fetchBrandFromDB(brandId) {
  try {
    console.log(`🔍 Fetching brand from MongoDB (ID: ${brandId})...`);
    
    const brand = await Brand.findById(brandId)
      .populate({
        path: 'sellerCentralAccountId',
        select: '+password +twoFAKey'
      });
    
    if (!brand) {
      throw new Error(`Brand not found with ID: ${brandId}`);
    }
    
    console.log(`✅ Found brand: ${brand.brandName}`);
    console.log(`📌 Brand URL from DB: ${brand.brandUrl}`);
    console.log(`🔓 Decrypting account credentials...`);
    
    // Decrypt the account credentials
    if (brand.sellerCentralAccountId && brand.sellerCentralAccountId.password) {
      brand.sellerCentralAccountId.password = decrypt(brand.sellerCentralAccountId.password);
      brand.sellerCentralAccountId.twoFAKey = decrypt(brand.sellerCentralAccountId.twoFAKey);
    }
    
    return brand;
  } catch (error) {
    console.error('❌ Failed to fetch brand from MongoDB:', error.message);
    throw error;
  }
}

/**
 * Fetch puppeteer configuration from MongoDB
 */
async function fetchPuppeteerConfig() {
  try {
    console.log('⚙️ Fetching Puppeteer configuration from MongoDB...');
    
    let config = await PuppeteerConfig.findOne();
    
    if (!config) {
      console.log('⚠️ No Puppeteer config found in MongoDB, using defaults');
      return {
        headless: true,
        timeout: 180000,
        sellerCentralUrl: 'https://sellercentral.amazon.com/home',
      };
    }
    
    console.log(`✅ Puppeteer config loaded from MongoDB:`);
    console.log(`   - Headless: ${config.headless}`);
    console.log(`   - Timeout: ${config.timeout}ms`);
    console.log(`   - Seller Central URL: ${config.sellerCentralUrl}`);
    return {
      headless: config.headless,
      timeout: config.timeout,
      sellerCentralUrl: config.sellerCentralUrl,
    };
  } catch (error) {
    console.warn('⚠️ Failed to fetch Puppeteer config from MongoDB, using defaults:', error.message);
    return {
      headless: true,
      timeout: 180000,
      sellerCentralUrl: 'https://sellercentral.amazon.com/home',
    };
  }
}

/**
 * Load configuration from MongoDB or environment variables
 */
async function loadConfiguration() {
  console.log('⚙️ Loading configuration...');
  
  // Connect to MongoDB
  await connectDB();
  
  // Fetch Puppeteer configuration from MongoDB (unless overridden by env vars)
  const puppeteerConfig = await fetchPuppeteerConfig();
  
  // Apply Puppeteer config (env vars take precedence for testing)
  if (process.env.HEADLESS !== undefined) {
    CONFIG.headless = process.env.HEADLESS === 'true';
    console.log(`📌 Using HEADLESS from environment: ${CONFIG.headless}`);
  } else {
    CONFIG.headless = puppeteerConfig.headless;
    console.log(`📌 Using HEADLESS from MongoDB: ${CONFIG.headless}`);
  }
  
  if (process.env.TIMEOUT_MS !== undefined) {
    CONFIG.timeout = parseInt(process.env.TIMEOUT_MS, 10);
    console.log(`📌 Using TIMEOUT_MS from environment: ${CONFIG.timeout}ms`);
  } else {
    CONFIG.timeout = puppeteerConfig.timeout;
    console.log(`📌 Using TIMEOUT_MS from MongoDB: ${CONFIG.timeout}ms`);
  }
  
  // Seller Central URL (env var override for testing only)
  if (process.env.SELLER_CENTRAL_URL !== undefined) {
    CONFIG.sellerCentralUrl = process.env.SELLER_CENTRAL_URL;
    console.log(`📌 Using SELLER_CENTRAL_URL from environment: ${CONFIG.sellerCentralUrl}`);
  } else {
    CONFIG.sellerCentralUrl = puppeteerConfig.sellerCentralUrl;
    console.log(`📌 Using SELLER_CENTRAL_URL from MongoDB: ${CONFIG.sellerCentralUrl}`);
  }
  
  // Check if we're in API mode (specific brand requested by ID)
  if (CONFIG.brandId) {
    console.log('🎯 API Mode: Single Brand by ID');
    const brand = await fetchBrandFromDB(CONFIG.brandId);
    const account = brand.sellerCentralAccountId;
    
    CONFIG.accountName = account.accountName;
    CONFIG.username = account.username;
    CONFIG.password = account.password;
    CONFIG.twoFAKey = account.twoFAKey;
    CONFIG.brandName = brand.brandName;
    CONFIG.brandUrl = brand.brandUrl;
    
    console.log(`✅ CONFIG populated with brand data:`);
    console.log(`   - Account: ${CONFIG.accountName}`);
    console.log(`   - Brand Name: ${CONFIG.brandName}`);
    console.log(`   - Brand URL: ${CONFIG.brandUrl}`);
    
    return;
  }
  
  // Check if account ID is provided
  if (CONFIG.accountId) {
    console.log('🎯 Fetching from MongoDB by Account ID');
    const account = await fetchAccountFromDB(CONFIG.accountId);
    
    CONFIG.accountName = account.accountName;
    CONFIG.username = account.username;
    CONFIG.password = account.password;
    CONFIG.twoFAKey = account.twoFAKey;
    
    // Fetch brands for this account
    CONFIG.brands = await fetchBrandsFromDB(CONFIG.accountId);
    
    return;
  }
  
  // If no account ID or brand ID is provided, we can't proceed
  throw new Error('No ACCOUNT_ID or BRAND_ID provided. Worker must be triggered with a valid account or brand ID.');
}

// Validate configuration
function validateConfiguration() {
  const required = ['username', 'password', 'twoFAKey'];
  const missing = required.filter(key => !CONFIG[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
}

/**
 * Login to Amazon Seller Central
 */
async function login(page) {
  try {
    console.log('🔐 Starting login process...');
    
    // Navigate to Seller Central
    console.log('📍 Navigating to Seller Central...');
    await page.goto(CONFIG.sellerCentralUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Check if already logged in
    const isLoggedIn = await page.evaluate(() => {
      return document.querySelector('#sc-navbar') !== null || 
             document.querySelector('nav[data-test-id="navbar"]') !== null ||
             document.querySelector('#sc-mkt-picker-switcher-select') !== null;
    });

    if (isLoggedIn) {
      console.log('✅ Already logged in!');
      return { success: true, step: 'login', message: 'Already logged in' };
    }

    // Check if password field is already visible (email pre-filled scenario)
    console.log('🔍 Checking login form state...');
    const passwordFieldVisible = await page.evaluate(() => {
      const passwordField = document.querySelector('input[type="password"], input[name="password"], input#ap_password');
      return passwordField !== null && passwordField.offsetParent !== null;
    });

    if (passwordFieldVisible) {
      // Email is already filled, skip to password entry
      console.log('ℹ️ Email already filled, proceeding to password entry...');
    } else {
      // Need to enter email first
      console.log('⏳ Waiting for email field...');
      try {
        await page.waitForSelector('input[type="email"], input[name="email"], input#ap_email', {
          timeout: 15000,
        });
      } catch (error) {
        // Check for captcha
        const hasCaptcha = await page.evaluate(() => {
          return document.body.innerText.includes('Enter the characters you see below') ||
                 document.querySelector('#auth-captcha-image') !== null;
        });
        
        if (hasCaptcha) {
          throw new Error('CAPTCHA detected - manual intervention required');
        }
        throw new Error('Login form not found - page may have changed');
      }

      // Check if email field is disabled or already has value
      const emailFieldState = await page.evaluate(() => {
        const emailField = document.querySelector('input[type="email"], input[name="email"], input#ap_email');
        return {
          disabled: emailField?.disabled || false,
          hasValue: emailField?.value ? emailField.value.length > 0 : false,
        };
      });

      if (emailFieldState.disabled || emailFieldState.hasValue) {
        console.log('ℹ️ Email field is disabled or already filled, skipping email entry...');
      } else {
        // Enter username/email
        console.log('📧 Entering username...');
        await page.type('input[type="email"], input[name="email"], input#ap_email', CONFIG.username, {
          delay: 100,
        });
      }

      // Click Continue/Next button
      console.log('👉 Clicking continue...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
        page.click('input#continue, input[type="submit"], button[type="submit"]'),
      ]);

      // Wait a moment for page transition
      await wait(2000);
    }

    // Enter password
    console.log('🔑 Waiting for password field...');
    await page.waitForSelector('input[type="password"], input[name="password"], input#ap_password', {
      timeout: 15000,
    });

    console.log('🔑 Entering password...');
    await page.type('input[type="password"], input[name="password"], input#ap_password', CONFIG.password, {
      delay: 100,
    });

    // Click Sign In button
    console.log('👉 Clicking sign in...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {}),
      page.click('input#signInSubmit, button[type="submit"], input[type="submit"]'),
    ]);

    // Wait a moment
    await wait(2000);

    // Check for 2FA prompt
    console.log('🔍 Checking for 2FA prompt...');
    const needs2FA = await page.evaluate(() => {
      const bodyText = document.body.innerText.toLowerCase();
      return bodyText.includes('two-step verification') ||
             bodyText.includes('enter otp') ||
             bodyText.includes('authentication code') ||
             document.querySelector('input[name="otpCode"]') !== null ||
             document.querySelector('input[name="code"]') !== null;
    });

    if (needs2FA) {
      console.log('🔐 2FA required - generating code...');
      
      // Generate 2FA code
      const token = authenticator.generate(CONFIG.twoFAKey);
      console.log(`🔢 Generated 2FA code: ${token}`);

      // Wait for 2FA input field
      await page.waitForSelector('input[name="otpCode"], input[name="code"], input#auth-mfa-otpcode', {
        timeout: 10000,
      });

      console.log('📝 Entering 2FA code...');
      await page.type('input[name="otpCode"], input[name="code"], input#auth-mfa-otpcode', token, {
        delay: 100,
      });

      // Check "Don't require OTP on this browser" if available
      const rememberDeviceCheckbox = await page.$('input[name="rememberDevice"]');
      if (rememberDeviceCheckbox) {
        console.log('☑️ Selecting "Remember this device"...');
        await page.click('input[name="rememberDevice"]');
      }

      // Click Submit/Continue button
      console.log('👉 Submitting 2FA code...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {}),
        page.click('input#auth-signin-button, button[type="submit"], input[type="submit"]'),
      ]);

      await wait(3000);
    }

    // After 2FA (or regular login), just wait a bit and check for errors
    console.log('✅ Checking for login errors...');
    await wait(2000);
    
    // Check if credentials were invalid
    const hasError = await page.evaluate(() => {
      const bodyText = document.body.innerText.toLowerCase();
      return bodyText.includes('password is incorrect') ||
             bodyText.includes('cannot find an account') ||
             bodyText.includes('incorrect code') ||
             bodyText.includes('there was a problem');
    });

    if (hasError) {
      throw new Error('Invalid credentials or 2FA code');
    }

    console.log('✅ Login successful! (No errors detected)');
    return { success: true, step: 'login', message: 'Login successful' };

  } catch (error) {
    console.error('❌ Login failed:', error.message);
    return {
      success: false,
      step: 'login',
      message: error.message,
    };
  }
}

/**
 * Navigate to a specific brand URL
 */
async function navigateBrand(page, brandName, brandUrl) {
  try {
    if (!brandUrl) {
      console.log(`⚠️ Skipping ${brandName} - URL not configured`);
      return { success: true, brand: brandName, message: 'URL not configured - skipped' };
    }

    console.log(`🏷️ Opening brand: ${brandName}...`);
    
    // Open in new tab
    const newPage = await page.browser().newPage();
    
    await newPage.goto(brandUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Verify the page loaded correctly
    await newPage.waitForSelector('#sc-navbar, nav, [data-test-id="navbar"]', {
      timeout: 10000,
    });

    console.log(`✅ Successfully loaded ${brandName}`);
    return { success: true, brand: brandName, message: 'Brand loaded successfully' };

  } catch (error) {
    console.error(`❌ Failed to load ${brandName}:`, error.message);
    return {
      success: false,
      brand: brandName,
      message: error.message,
    };
  }
}

/**
 * Main worker function
 */
async function main() {
  let browser = null;
  const startTime = Date.now();
  
  // Set overall timeout
  const timeoutId = setTimeout(() => {
    console.error('❌ Worker timeout exceeded (3 minutes)');
    if (browser) {
      browser.close().catch(() => {});
    }
    process.exit(1);
  }, CONFIG.timeout);

  try {
    // Load configuration from MongoDB
    await loadConfiguration();
    
    // Write CONFIG to debug file
    const debugInfo = {
      timestamp: new Date().toISOString(),
      brandId: CONFIG.brandId,
      accountId: CONFIG.accountId,
      accountName: CONFIG.accountName,
      brandName: CONFIG.brandName,
      brandUrl: CONFIG.brandUrl,
      sellerCentralUrl: CONFIG.sellerCentralUrl,
    };
    fs.writeFileSync('debug-config.txt', JSON.stringify(debugInfo, null, 2));
    console.log('📝 Debug info written to debug-config.txt');
    console.log('📋 Current CONFIG:');
    console.log(JSON.stringify(debugInfo, null, 2));
    
    // Validate configuration
    console.log('🔍 Validating configuration...');
    validateConfiguration();

    // Launch browser
    console.log('🚀 Launching browser...');
    console.log(`   Headless mode: ${CONFIG.headless}`);
    
    browser = await puppeteer.launch({
      headless: CONFIG.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });

    const page = await browser.newPage();

    // Set user agent to avoid detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Remove webdriver property
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    // Perform login
    const loginResult = await login(page);
    
    if (!loginResult.success) {
      clearTimeout(timeoutId);
      await browser.close();
      console.error('❌ Final Result:', loginResult);
      process.exit(1);
    }

    // If we have a brand URL, navigate to it immediately
    if (CONFIG.brandUrl) {
      console.log(`\n🎯 Navigating to brand: ${CONFIG.brandName || 'Unknown'}`);
      console.log(`🌐 Brand URL: ${CONFIG.brandUrl}`);
      
      // Write navigation attempt to file
      const navInfo = {
        timestamp: new Date().toISOString(),
        action: 'ATTEMPTING NAVIGATION',
        brandName: CONFIG.brandName,
        brandUrl: CONFIG.brandUrl,
      };
      fs.appendFileSync('debug-config.txt', '\n\nNAVIGATION ATTEMPT:\n' + JSON.stringify(navInfo, null, 2));
      
      await page.goto(CONFIG.brandUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      
      await wait(2000);
      
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      // Write final result to file
      const finalInfo = {
        timestamp: new Date().toISOString(),
        action: 'NAVIGATION COMPLETE',
        requestedUrl: CONFIG.brandUrl,
        actualUrl: currentUrl,
        match: currentUrl === CONFIG.brandUrl,
      };
      fs.appendFileSync('debug-config.txt', '\n\nNAVIGATION RESULT:\n' + JSON.stringify(finalInfo, null, 2));
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const successResult = {
        success: true,
        message: `Logged in and navigated to ${CONFIG.brandName || 'brand'}`,
        accountName: CONFIG.accountName,
        brandName: CONFIG.brandName,
        brandUrl: CONFIG.brandUrl,
        currentUrl: currentUrl,
        duration: `${duration}s`,
      };

      console.log('\n✅ ========== SUCCESS ==========');
      console.log(JSON.stringify(successResult, null, 2));
      console.log('================================\n');
      console.log('🔍 Browser will remain open.');
      console.log('📌 Press Ctrl+C to close when done.');

      clearTimeout(timeoutId);
      await new Promise(() => {}); // Keep alive forever
      
    } else {
      // Standard Mode: Navigate to all brands
      console.log('\n🔄 Standard Mode: Navigating to all brands...');
      const brandsLoaded = [];
      const brandsFailed = [];

      for (const [brandName, brandUrl] of Object.entries(CONFIG.brands)) {
        const result = await navigateBrand(page, brandName, brandUrl);
        if (result.success) {
          brandsLoaded.push(brandName);
        } else {
          brandsFailed.push(brandName);
        }
      }

      // Success summary
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const successResult = {
        success: true,
        message: 'Login and brand navigation completed',
        brandsLoaded,
        brandsFailed: brandsFailed.length > 0 ? brandsFailed : undefined,
        duration: `${duration}s`,
      };

      console.log('\n✅ ========== SUCCESS ==========');
      console.log(JSON.stringify(successResult, null, 2));
      console.log('================================\n');

      // Keep browser open for debugging if not headless
      if (!CONFIG.headless) {
        console.log('🔍 Browser will remain open for debugging. Press Ctrl+C to close.');
        await new Promise(() => {}); // Keep alive
      }

      clearTimeout(timeoutId);
      await browser.close();
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
      process.exit(0);
    }

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('\n❌ ========== ERROR ==========');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('================================\n');

    const errorResult = {
      success: false,
      step: 'initialization',
      message: error.message,
    };
    console.error('Final Result:', JSON.stringify(errorResult, null, 2));

    if (browser) {
      await browser.close();
    }
    
    // Disconnect from MongoDB
    try {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    } catch (e) {
      console.error('Failed to disconnect from MongoDB:', e.message);
    }
    
    process.exit(1);
  }
}

// Run the worker
main();

