# TDD Feature Implementation Prompt

## Feature: Auction Buyout Price ("Buy It Now")

**Implement a "Buy It Now" feature for the auction system using Test-Driven Development (TDD).**

The feature should allow auction creators to optionally set a buyout price when creating an auction. When a bidder places a bid equal to or greater than the buyout price, they immediately win the auction.
Implement it in the backend folder that the code session was started in.

## Requirements

1. Add an optional `buyoutPrice` field to auction creation (can be null/None for auctions without buyout)
2. The buyout price must be greater than the starting price when provided
3. When a bid matches or exceeds the buyout price, the auction should automatically close with that bidder as the winner
4. Regular bids below the buyout price should work normally
5. Once an auction is bought out, no further bids should be accepted
6. The buyout price should be included in auction details when retrieving auction information

## TDD Process Instructions

**Follow strict TDD process:**

1. First write failing tests for each requirement
2. Then implement the minimum code to make each test pass
3. Refactor if needed while keeping tests green

## Test Cases to Implement (in order)

1. Test creating an auction with a valid buyout price
2. Test creating an auction fails when buyout price is less than or equal to starting price
3. Test that a bid matching the buyout price immediately closes the auction
4. Test that a bid exceeding the buyout price immediately closes the auction
5. Test that regular bids below buyout price work normally
6. Test that no bids are accepted after buyout
7. Test that auction details include the buyout price when present
8. Test that auctions can still be created without a buyout price (backward compatibility)

## Implementation Notes

- Use the existing test structure and patterns
- Run tests after each implementation step to ensure TDD compliance
- Ensure all existing tests continue to pass (regression testing)
- Follow the coding conventions and patterns already established in the codebase

## Expected Outcomes

This feature will demonstrate:
- Type safety and compile-time checking (Java) vs runtime validation (Python)
- Handling of nullable/optional values in both languages
- Decimal/monetary calculation precision
- Business logic validation patterns
- Test-driven development workflow