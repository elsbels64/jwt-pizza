# 1
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click                                                       |
| Classification | Broken Access Control                                                                      |
| Severity       | 1                                                                              |
| Description    | Register existing user with different email.                 |
| Images         | ![Dead database](deadDatabase.png) <br/> can still log into past user, but admin priveleges may have been removed. |
| Corrections    | Check if user already exists before registering.                                                          |
# 2
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click                                                       |
| Classification | Broken Access Control                                                                     |
| Severity       | 0                                                                              |
| Description    | Order with previously logged out user.                 |
| Images         | ![Dead database](deadDatabase.png) <br/>. autentication missing.|
| Corrections    | None. Code works properly        |
# 3
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click                                                       |
| Classification | Broken Access Control                                                                      |
| Severity       | 3                                                                             |
| Description    | Altering the price of the order to $0, $-1000000000, $-1, and $100000000.                 |
| Images         | ![Dead database](deadDatabase.png) <br/>. ![Dead database](deadDatabase.png) <br/>.
 ![Dead database](deadDatabase.png) <br/>. ![Dead database](deadDatabase.png) <br/>. could order for 0 and negative 1, but the larger values were out of range.|
| Corrections    | double check that price matches database item order price. Don't allow negative numbers or 0.      |
# 4
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click                                                       |
| Classification | Broken Access Control                                                                      |
| Severity       | 3                                                                           |
| Description    | change order to non-existent store.                 |
| Images         | ![Dead database](deadDatabase.png) <br/>. placed an order with non-existing store|
| Corrections    | check that store exists before ordering   |

# 5
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | June 13, 2026                                                                  |
| Target         | pizza.elisew.click                                                       |
| Classification | Broken Access Control                                                                     |
| Severity       | 3                                                                            |
| Description    | change order to non-existent franchise.                 |
| Images         | ![Dead database](deadDatabase.png) <br/>.  placed an order with non-existing franchise |
| Corrections    | check that franchize exists before ordering   |
