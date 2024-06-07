import { TomlFields } from './types';
import axios from 'axios';
import toml from 'toml';

export enum Anchors {
  TEST = 'https://testanchor.stellar.org',
}
export async function getStellarToml(home_domain: string) {
  const formattedDomain = home_domain.replace(/^https?:\/\//, '');
  const tomlResponse = await axios.get(`https://${formattedDomain}/.well-known/stellar.toml`);
  const parsedResponse = toml.parse(tomlResponse.data)
  return parsedResponse;
}

export async function getAuthUrl(home_domain: string) {
  const toml = await getStellarToml(home_domain);
  return toml[TomlFields.WEB_AUTH_ENDPOINT];
}

export async function getKycUrl(home_domain: string) {
  const toml = await getStellarToml(home_domain);
  return toml[TomlFields.WEB_AUTH_ENDPOINT];
}

export async function getTransferServerUrl(home_domain: string) {
  const toml = await getStellarToml(home_domain);
  return toml[TomlFields.TRANSFER_SERVER_SEP0024];
}

export async function getDepositServerUrl(home_domain: string) {
  const toml = await getStellarToml(home_domain);
  return toml[TomlFields.TRANSFER_SERVER_SEP0024];
}