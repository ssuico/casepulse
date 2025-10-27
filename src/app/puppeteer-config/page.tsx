'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface PuppeteerConfig {
  _id: string;
  headless: boolean;
  timeout: number;
  sellerCentralUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function PuppeteerConfigPage() {
  const [config, setConfig] = useState<PuppeteerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [headless, setHeadless] = useState(true);
  const [timeoutValue, setTimeoutValue] = useState(180000);
  const [sellerCentralUrl, setSellerCentralUrl] = useState('https://sellercentral.amazon.com/home');

  // Original state for tracking changes
  const [originalHeadless, setOriginalHeadless] = useState(true);
  const [originalTimeout, setOriginalTimeout] = useState(180000);
  const [originalSellerCentralUrl, setOriginalSellerCentralUrl] = useState('https://sellercentral.amazon.com/home');

  // Check if there are unsaved changes
  const hasChanges = 
    headless !== originalHeadless ||
    timeoutValue !== originalTimeout ||
    sellerCentralUrl !== originalSellerCentralUrl;

  // Fetch configuration on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/puppeteer-config');
      const result = await response.json();

      if (result.success && result.data) {
        setConfig(result.data);
        setHeadless(result.data.headless);
        setTimeoutValue(result.data.timeout);
        setSellerCentralUrl(result.data.sellerCentralUrl);
        
        // Update original state for change tracking
        setOriginalHeadless(result.data.headless);
        setOriginalTimeout(result.data.timeout);
        setOriginalSellerCentralUrl(result.data.sellerCentralUrl);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/puppeteer-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headless,
          timeout: timeoutValue,
          sellerCentralUrl,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setConfig(result.data);
        
        // Update original state after successful save
        setOriginalHeadless(result.data.headless);
        setOriginalTimeout(result.data.timeout);
        setOriginalSellerCentralUrl(result.data.sellerCentralUrl);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setHeadless(originalHeadless);
    setTimeoutValue(originalTimeout);
    setSellerCentralUrl(originalSellerCentralUrl);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Puppeteer Configuration</h1>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3">Loading configuration...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Puppeteer Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure global settings for the Puppeteer automation worker
          </p>
        </div>

        {/* Worker Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Worker Settings</CardTitle>
            <CardDescription>
              These settings control how the Puppeteer worker behaves when automating Amazon Seller Central login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Headless Mode */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="headless" className="text-base font-medium">
                    Headless Mode
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Run browser in headless mode (no visible window). Disable for debugging.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={headless ? 'default' : 'secondary'} className="mr-2">
                    {headless ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Switch
                    id="headless"
                    checked={headless}
                    onCheckedChange={setHeadless}
                  />
                </div>
              </div>
            </div>

            {/* Timeout */}
            <div className="space-y-2">
              <Label htmlFor="timeout" className="text-base font-medium">
                Timeout (milliseconds)
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Maximum time (in milliseconds) the worker will run before timing out. Default: 180000ms (3 minutes)
              </p>
              <Input
                id="timeout"
                type="number"
                min="30000"
                max="600000"
                step="1000"
                value={timeoutValue}
                onChange={(e) => setTimeoutValue(Number(e.target.value))}
                className="max-w-md"
              />
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>≈ {(timeoutValue / 1000).toFixed(0)} seconds</span>
                <span>•</span>
                <span>{(timeoutValue / 60000).toFixed(1)} minutes</span>
              </div>
            </div>

            {/* Seller Central URL */}
            <div className="space-y-2">
              <Label htmlFor="sellerCentralUrl" className="text-base font-medium">
                Seller Central URL
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                The initial URL the worker navigates to. Usually the Seller Central homepage.
              </p>
              <Input
                id="sellerCentralUrl"
                type="url"
                value={sellerCentralUrl}
                onChange={(e) => setSellerCentralUrl(e.target.value)}
                placeholder="https://sellercentral.amazon.com/home"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={saving || !hasChanges}
              >
                Reset
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || !hasChanges}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {config && (
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Worker Settings last updated: {new Date(config.updatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

