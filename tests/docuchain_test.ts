import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Can store a new document",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall("docuchain", "store-document", [
        types.ascii("QmHash123"),
        types.ascii("Test Document"),
        types.ascii("application/pdf")
      ], wallet_1.address)
    ]);
    
    assertEquals(block.receipts[0].result, '(ok true)');
  },
});

Clarinet.test({
  name: "Can verify an existing document",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall("docuchain", "store-document", [
        types.ascii("QmHash123"),
        types.ascii("Test Document"),
        types.ascii("application/pdf")
      ], wallet_1.address),
      Tx.contractCall("docuchain", "verify-document", [
        types.ascii("QmHash123")
      ], wallet_1.address)
    ]);
    
    assertEquals(block.receipts[1].result.expectOk().expectTuple(), {
      'owner': wallet_1.address,
      'title': 'Test Document',
      'mime-type': 'application/pdf',
      'timestamp': types.uint(block.height - 1),
      'status': 'active'
    });
  },
});

Clarinet.test({
  name: "Can grant and check access",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    const wallet_2 = accounts.get("wallet_2")!;
    
    let block = chain.mineBlock([
      Tx.contractCall("docuchain", "store-document", [
        types.ascii("QmHash123"),
        types.ascii("Test Document"),
        types.ascii("application/pdf")
      ], wallet_1.address),
      Tx.contractCall("docuchain", "grant-access", [
        types.ascii("QmHash123"),
        types.principal(wallet_2.address),
        types.bool(true),
        types.bool(false)
      ], wallet_1.address),
      Tx.contractCall("docuchain", "check-access", [
        types.ascii("QmHash123"),
        types.principal(wallet_2.address)
      ], wallet_2.address)
    ]);
    
    assertEquals(block.receipts[2].result.expectTuple(), {
      'can-read': true,
      'can-update': false
    });
  },
});
